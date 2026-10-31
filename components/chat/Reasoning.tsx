"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReasoningMessagePartProps } from "@assistant-ui/react";

export function ReasoningPart({ text, status }: ReasoningMessagePartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRunning = status?.type === "running";

  if (!text && !isRunning) return null;

  return (
    <div className="my-2 rounded-md border border-border/80 bg-muted/30 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer select-none"
      >
        <span className="flex items-center gap-1.5 font-medium text-[11px]">
          <Brain className="size-3.5 text-primary shrink-0" />
          <span>{isRunning ? "Reasoning..." : "Thought process"}</span>
          {isRunning && (
            <span className="inline-flex gap-0.5 ml-1 items-center">
              <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1 rounded-full bg-primary animate-bounce" />
            </span>
          )}
        </span>
        {isOpen || isRunning ? (
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-3 text-muted-foreground shrink-0" />
        )}
      </button>

      {(isOpen || isRunning) && text && (
        <div className="px-3 pb-2.5 pt-1 border-t border-border/40 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
          {text}
        </div>
      )}
    </div>
  );
}
