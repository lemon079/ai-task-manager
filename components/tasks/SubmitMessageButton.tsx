"use client";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useSendMessage } from "@/hooks/useSendMessage"; // import your hook
import { Input } from "../ui/input";

export function SubmitMessageButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value;
    if (!content) return;

    if (inputRef.current) {
      inputRef.current.value = "";
    }
    sendMessage({ content }); // call the mutation
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Ask"
        className="flex-1 border p-2 rounded"
      />
      <Button variant={"customBlue"} disabled={isPending} type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : <Send />}
      </Button>
    </form>
  );
}
