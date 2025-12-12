"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useMemo } from "react";
import { Message } from "@prisma/client";
import { useGetMessages } from "@/hooks/useGetMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User } from "lucide-react";

export default function ChatMessages() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { data: messages, isLoading } = useGetMessages();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Memoize markdown components to prevent recreation on every render
  const markdownComponents = useMemo(
    () => ({
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="list-decimal list-inside space-y-2 my-2">{children}</ol>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
      ),
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="leading-relaxed">{children}</p>
      ),
      code: ({ children }: { children?: React.ReactNode }) => (
        <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">
          {children}
        </code>
      ),
    }),
    []
  );

  return (
    <ScrollArea className="h-full !no-scrollbar scroll-smooth">
      <div className="flex flex-col gap-4 p-4">
        {messages?.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="size-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Send a message to get started.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Try: &quot;Create a high priority task to review PRs by Friday&quot;
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-20 w-64 rounded-2xl" />
            </div>
          </div>
        )}

        {messages?.map((msg: Message) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
              }`}>
              {msg.role === "user" ? (
                <User className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[70%] p-4 text-sm rounded-2xl shadow-sm whitespace-pre-wrap break-words ${msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border rounded-bl-sm"
                }`}
            >
              <ReactMarkdown components={markdownComponents}>
                {msg.content.trim()}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
