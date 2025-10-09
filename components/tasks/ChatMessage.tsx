"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";
import { Message } from "@prisma/client";
import { useGetMessages } from "@/hooks/useGetMessages"; // import your hook
import CustomLoader from "../shared/CustomLoader";

export default function ChatMessages() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Use your custom hook
  const { data: messages, isLoading } = useGetMessages();

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-full !no-scrollbar scroll-smooth mx-2">
      <div className="flex flex-col gap-3">
        {messages?.length === 0 && (
          <p className="no-result mt-4">Send message to g et started.</p>
        )}
        {isLoading && <CustomLoader/>}
        {messages?.map((msg: Message) => (
          <div
            key={msg.id}
            className={`flex w-full my-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-4 text-sm rounded-2xl shadow whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              <ReactMarkdown
                components={{
                  ol: ({ children }) => <ol className="leading-2.5 space-y-4 ml-2">{children}</ol>,
                  ul: ({ children }) => <ul className="list-disc list-inside leading-2.5 my-2">{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                  p: ({ children }) => <p className="my-0.5">{children}</p>,
                }}
              >
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
