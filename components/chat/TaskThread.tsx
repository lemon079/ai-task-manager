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
  Sparkles,
  Bot,
  User,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MarkdownText = () => <MarkdownTextPrimitive />;

export function TaskThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-[calc(100dvh-5.5rem)] max-w-4xl mx-auto w-full px-3 sm:px-6 relative">
      {/* Scrollable Message Viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-1 py-4 space-y-6 scroll-smooth">
        {/* Interactive Empty State with Starter Prompts */}
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full min-h-[380px] text-center px-4 animate-in fade-in-50 duration-200">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary shadow-xs">
              <Sparkles className="size-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              NeuraTask AI
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              Ask me to manage your schedule, create tasks, prioritize work, or
              summarize pending items.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-xl">
              {[
                "Create a high-priority task: Deploy dev build by Friday",
                "What tasks are currently pending or overdue?",
                "Schedule team sprint review for next Monday at 10am",
                "Create a task to buy groceries & snacks for $45; complete before 8pm",
              ].map((prompt) => (
                <ThreadPrimitive.Suggestion
                  key={prompt}
                  prompt={prompt}
                  method="replace"
                  autoSend
                  className="text-left text-xs p-3.5 rounded-xl border border-border/80 bg-card hover:bg-accent/60 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <MessagePrimitive.Root className="flex justify-end gap-3 group animate-in fade-in-50 slide-in-from-bottom-2 duration-180">
                <div className="max-w-[85%] sm:max-w-[70%] bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-xs shadow-xs text-sm leading-relaxed whitespace-pre-wrap break-words">
                  <MessagePrimitive.Content />
                </div>
              </MessagePrimitive.Root>
            ),
            AssistantMessage: () => (
              <MessagePrimitive.Root className="flex gap-3.5 group animate-in fade-in-50 duration-200">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20 shadow-xs">
                  <Bot className="size-4" />
                </div>
                <div className="flex-1 space-y-2 overflow-hidden">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                    <MessagePrimitive.Content
                      components={{
                        Text: MarkdownText,
                      }}
                    />
                  </div>

                  {/* Contextual Action Bar & Branch Picker */}
                  <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <ActionBarPrimitive.Root className="flex items-center gap-1 bg-muted/60 border border-border/50 rounded-lg p-0.5">
                      <ActionBarPrimitive.Copy asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Copy to clipboard"
                        >
                          <MessagePrimitive.If copied>
                            <Check className="size-3.5 text-green-500" />
                          </MessagePrimitive.If>
                          <MessagePrimitive.If copied={false}>
                            <Copy className="size-3.5" />
                          </MessagePrimitive.If>
                        </Button>
                      </ActionBarPrimitive.Copy>
                    </ActionBarPrimitive.Root>

                    <BranchPickerPrimitive.Root className="flex items-center text-xs text-muted-foreground">
                      <BranchPickerPrimitive.Previous asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="size-3" />
                        </Button>
                      </BranchPickerPrimitive.Previous>
                      <span className="px-1.5 font-mono text-[11px]">
                        <BranchPickerPrimitive.Number />
                      </span>
                      <BranchPickerPrimitive.Next asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-foreground"
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
          className="absolute bottom-20 right-6 size-9 rounded-full shadow-md z-10 bg-background hover:bg-accent animate-in fade-in duration-150"
          title="Scroll to bottom"
        >
          <ArrowDown className="size-4" />
        </Button>
      </ThreadPrimitive.ScrollToBottom>

      {/* Multiline Expanding Composer */}
      <ComposerPrimitive.Root className="pb-4 pt-2">
        <div className="relative flex items-end gap-2 bg-card border border-border/80 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 rounded-2xl p-2 shadow-sm transition-all">
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Type a message... (e.g., 'Create a task to review PRs by Friday')"
            className="flex-1 max-h-36 min-h-[44px] resize-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
          />

          <ComposerPrimitive.Send asChild>
            <Button
              size="icon"
              className="size-9 rounded-xl shrink-0 transition-transform active:scale-95"
              title="Send message (Enter)"
            >
              <ArrowUp className="size-4" />
            </Button>
          </ComposerPrimitive.Send>

          <ComposerPrimitive.Cancel asChild>
            <Button
              size="icon"
              variant="destructive"
              className="size-9 rounded-xl shrink-0 animate-in fade-in active:scale-95"
              title="Stop generation"
            >
              <Square className="size-3.5 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </div>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
