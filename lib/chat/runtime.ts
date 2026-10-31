"use client";

import { useLocalRuntime, type ChatModelAdapter, fromThreadMessageLike } from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

export interface InitialChatMessage {
  id: number | string;
  role: string;
  content: string;
  createdAt?: string | Date;
}

export function useTaskAgentRuntime(initialMessages: InitialChatMessage[] = []) {
  const queryClient = useQueryClient();

  // Convert initial database messages into assistant-ui message models
  const initialThreadMessages = useMemo(() => {
    return initialMessages.map((m) =>
      fromThreadMessageLike(
        {
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
        },
        String(m.id),
        { type: "complete", reason: "stop" }
      )
    );
  }, [initialMessages]);

  const chatModel = useMemo<ChatModelAdapter>(() => {
    return {
      async *run({ messages, abortSignal }) {
        const lastMessage = messages[messages.length - 1];
        let content = "";

        if (typeof lastMessage.content === "string") {
          content = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          content = lastMessage.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n");
        }

        try {
          const response = await fetch("/api/agents/task?stream=true", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({ content }),
            signal: abortSignal,
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errorMsg =
              errData.error || errData.message || `Request failed with status ${response.status}`;
            toast.error(errorMsg);
            yield {
              content: [
                {
                  type: "text" as const,
                  text: `⚠️ **Error**: ${errorMsg}`,
                },
              ],
            };
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            yield {
              content: [
                {
                  type: "text" as const,
                  text: "Failed to connect to agent stream.",
                },
              ],
            };
            return;
          }

          const decoder = new TextDecoder();
          let buffer = "";
          let accumulatedText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split("\n\n");
            buffer = blocks.pop() || "";

            for (const block of blocks) {
              const lines = block.split("\n");
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;

                const jsonStr = trimmed.slice(6);
                try {
                  const event = JSON.parse(jsonStr);

                  if (event.type === "chunk" && event.text) {
                    accumulatedText += event.text;
                    yield {
                      content: [
                        {
                          type: "text" as const,
                          text: accumulatedText,
                        },
                      ],
                    };
                  } else if (event.type === "tool_end" && event.isMutating) {
                    // Event-driven React Query invalidation triggered by real tool mutations
                    queryClient.invalidateQueries({ queryKey: ["tasks"] });
                    queryClient.invalidateQueries({ queryKey: ["messages"] });
                  } else if (event.type === "done") {
                    if (event.fullText && event.fullText !== accumulatedText) {
                      accumulatedText = event.fullText;
                      yield {
                        content: [
                          {
                            type: "text" as const,
                            text: accumulatedText,
                          },
                        ],
                      };
                    }
                  } else if (event.type === "error") {
                    toast.error(event.error);
                  }
                } catch {
                  // Ignore JSON parse errors for incomplete chunk frames
                }
              }
            }
          }

          if (!accumulatedText.trim()) {
            yield {
              content: [
                {
                  type: "text" as const,
                  text: "Action executed successfully.",
                },
              ],
            };
          }
        } catch (err: unknown) {
          if (abortSignal.aborted) {
            yield {
              content: [
                {
                  type: "text" as const,
                  text: "_Generation stopped by user._",
                },
              ],
            };
            return;
          }

          const errorMsg =
            err instanceof Error ? err.message : "Failed to execute agent action";
          toast.error(errorMsg);

          yield {
            content: [
              {
                type: "text" as const,
                text: `⚠️ **Error**: ${errorMsg}`,
              },
            ],
          };
        }
      },
    };
  }, [queryClient]);

  return useLocalRuntime(chatModel, {
    initialMessages: initialThreadMessages,
  });
}
