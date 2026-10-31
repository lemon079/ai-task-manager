"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ActionBarPrimitive,
  BranchPickerPrimitive,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import {
  ArrowUp,
  Square,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Bot,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MarkdownText = () => <MarkdownTextPrimitive />;

export function TaskThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-[calc(100dvh-5.5rem)] max-w-2xl mx-auto w-full relative">
      {/* Scrollable Message Viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scroll-smooth">
        {/* Minimal Empty State */}
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="size-8 rounded-md bg-muted text-foreground flex items-center justify-center mb-3">
              <Bot className="size-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Task Assistant
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create, organize, or summarize your tasks using natural language.
            </p>

            <div className="flex flex-col gap-1.5 mt-6 w-full max-w-md">
              {[
                "Create a task: Deploy dev build by Friday",
                "What tasks are currently pending or overdue?",
                "Schedule team sprint review for Monday at 10am",
              ].map((prompt) => (
                <ThreadPrimitive.Suggestion
                  key={prompt}
                  prompt={prompt}
                  method="replace"
                  autoSend
                  className="text-left text-xs p-2.5 rounded-md border border-border/80 bg-card hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
                >
                  {prompt}
                </ThreadPrimitive.Suggestion>
              ))}
            </div>
          </div>
        </ThreadPrimitive.Empty>

        {/* Message Stream */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => (
              <MessagePrimitive.Root className="flex justify-end group">
                <div className="max-w-[80%] sm:max-w-[70%] bg-muted text-foreground px-3 py-2 rounded-md text-xs leading-relaxed whitespace-pre-wrap break-words">
                  <MessagePrimitive.Content />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="flex gap-2.5 group">
                <div className="size-6 rounded bg-muted/80 text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="size-3.5" />
                </div>
                <div className="flex-1 space-y-1.5 overflow-hidden min-w-0">
                  <div className="prose prose-xs dark:prose-invert max-w-none text-foreground leading-relaxed text-xs">
                    <MessagePrimitive.Content
                      components={{
                        Text: MarkdownText,
                      }}
                    />
                  </div>

                  {/* Contextual Action Bar & Branch Picker - Hidden until hover */}
                  <div className="flex items-center gap-2 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionBarPrimitive.Root className="flex items-center">
                      <ActionBarPrimitive.Copy asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 rounded text-muted-foreground hover:text-foreground"
                          title="Copy message"
                        >
                          <MessagePrimitive.If copied>
                            <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                          </MessagePrimitive.If>
                          <MessagePrimitive.If copied={false}>
                            <Copy className="size-3" />
                          </MessagePrimitive.If>
                        </Button>
                      </ActionBarPrimitive.Copy>
                    </ActionBarPrimitive.Root>

                    <BranchPickerPrimitive.Root className="flex items-center text-[11px] text-muted-foreground">
                      <BranchPickerPrimitive.Previous asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 rounded text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="size-3" />
                        </Button>
                      </BranchPickerPrimitive.Previous>
                      <span className="px-1 font-mono text-[10px]">
                        <BranchPickerPrimitive.Number />
                      </span>
                      <BranchPickerPrimitive.Next asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 rounded text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight className="size-3" />
                        </Button>
                      </BranchPickerPrimitive.Next>
                    </BranchPickerPrimitive.Root>
                  </div>
                </div>
              </MessagePrimitive.Root>
            ),
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Floating Scroll to Bottom Indicator */}
      <ThreadPrimitive.ScrollToBottom asChild>
        <Button
          size="icon"
          variant="outline"
          className="absolute bottom-16 right-4 size-7 rounded-full shadow-sm z-10 bg-background text-muted-foreground hover:text-foreground"
          title="Scroll to bottom"
        >
          <ArrowDown className="size-3.5" />
        </Button>
      </ThreadPrimitive.ScrollToBottom>

      {/* Fixed Composer at Bottom with Soft Border */}
      <div className="sticky bottom-0 bg-background pt-2 pb-3">
        <ComposerPrimitive.Root>
          <div className="relative flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5 focus-within:border-foreground/40 transition-colors">
            <ComposerPrimitive.Input
              rows={1}
              autoFocus
              placeholder="Ask anything or create a task..."
              className="flex-1 max-h-28 min-h-[36px] resize-none bg-transparent py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
            />

            {/* Single button swapping between Send and Stop */}
            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send asChild>
                <Button
                  size="icon"
                  className="size-7 rounded bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
              </ComposerPrimitive.Send>
            </ThreadPrimitive.If>

            <ThreadPrimitive.If running>
              <ComposerPrimitive.Cancel asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded bg-foreground text-background hover:bg-foreground/90 shrink-0 cursor-pointer"
                  title="Stop generation"
                >
                  <Square className="size-3 fill-current" />
                </Button>
              </ComposerPrimitive.Cancel>
            </ThreadPrimitive.If>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
