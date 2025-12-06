"use client";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useSendMessage } from "@/hooks/useSendMessage";
import { Input } from "../ui/input";

export function SubmitMessageButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value?.trim();
    if (!content) return;

    if (inputRef.current) {
      inputRef.current.value = "";
    }
    sendMessage({ content });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-3 items-center w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type a message... (e.g., 'Create a task to review PRs by Friday')"
        className="flex-1 h-11 bg-background"
        disabled={isPending}
      />
      <Button
        size="lg"
        disabled={isPending}
        type="submit"
        className="h-11 px-6"
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <Send className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

