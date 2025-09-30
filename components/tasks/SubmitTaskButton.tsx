"use client";

import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useTaskAgent } from "@/app/hooks/useTaskAgent";
import IconWrapper from "../shared/IconWrapper";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export function SubmitTaskButton() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: taskAgent, isPending } = useTaskAgent();
    const router = useRouter();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputRef.current?.value) {
            taskAgent({ input: inputRef.current.value });
            inputRef.current.value = "";
            router.refresh();
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex gap-2 items-center w-full">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Ask"
                className="flex-1"
            />
            <Button disabled={isPending} variant={"customBlue"}>
                {isPending ? <IconWrapper icon={Loader2} className="animate-spin" /> : <IconWrapper icon={Send} />}
            </Button>
        </form>
    );
}
