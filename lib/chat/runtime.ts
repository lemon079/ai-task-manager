"use client";

import { useLocalRuntime, type ChatModelAdapter, fromThreadMessageLike } from "@assistant-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
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
      async run({ messages, abortSignal }) {
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
          const res = await axios.post(
            "/api/agents/task",
            { content },
            { signal: abortSignal }
          );

          // Invalidate task queries so newly created/modified tasks show up on dashboard immediately
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["messages"] });

          const outputText = res.data?.result || "Action executed successfully.";

          return {
            content: [
              {
                type: "text" as const,
                text: outputText,
              },
            ],
          };
        } catch (err: unknown) {
          if (axios.isCancel(err)) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "_Generation stopped by user._",
                },
              ],
            };
          }

          const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
          const errorMsg =
            axiosErr.response?.data?.error ||
            axiosErr.response?.data?.message ||
            (err instanceof Error ? err.message : "Failed to execute agent action");

          toast.error(errorMsg);

          return {
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
