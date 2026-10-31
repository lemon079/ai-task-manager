"use client";

import React from "react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import { cn } from "@/lib/utils";

export function MarkdownText(_props?: any) {
  return (
    <MarkdownTextPrimitive
      className="text-xs leading-relaxed text-foreground space-y-2"
      smooth
      components={{
        h1: ({ className, ...props }) => (
          <h1
            className={cn(
              "text-sm font-semibold tracking-tight text-foreground mt-3 mb-1 first:mt-0",
              className
            )}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2
            className={cn(
              "text-xs font-semibold tracking-tight text-foreground mt-2.5 mb-1 first:mt-0",
              className
            )}
            {...props}
          />
        ),
        h3: ({ className, ...props }) => (
          <h3
            className={cn(
              "text-xs font-semibold text-foreground mt-2 mb-0.5 first:mt-0",
              className
            )}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p className={cn("text-xs leading-relaxed my-1 first:mt-0 last:mb-0", className)} {...props} />
        ),
        ul: ({ className, ...props }) => (
          <ul
            className={cn(
              "list-disc list-outside pl-4 space-y-1 my-1.5 text-xs text-foreground",
              className
            )}
            {...props}
          />
        ),
        ol: ({ className, ...props }) => (
          <ol
            className={cn(
              "list-decimal list-outside pl-4 space-y-1 my-1.5 text-xs text-foreground",
              className
            )}
            {...props}
          />
        ),
        li: ({ className, ...props }) => (
          <li className={cn("leading-relaxed", className)} {...props} />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn(
              "border-l-2 border-border pl-3 text-muted-foreground italic my-2 text-xs",
              className
            )}
            {...props}
          />
        ),
        code: ({ className, children, ...props }: any) => {
          return (
            <code
              className={cn(
                "rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground border border-border/40",
                className
              )}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ className, ...props }) => (
          <pre
            className={cn(
              "my-2 overflow-x-auto rounded-md bg-muted/60 border border-border/70 p-3 text-[11px] font-mono leading-normal text-foreground",
              className
            )}
            {...props}
          />
        ),
        a: ({ className, href, children, ...props }: any) => {
          const isSafe = !href || /^(https?:|mailto:)/i.test(href);
          if (!isSafe) {
            return <span className={cn("text-muted-foreground underline", className)}>{children}</span>;
          }
          return (
            <a
              href={href}
              className={cn(
                "text-primary underline underline-offset-2 hover:opacity-80 transition-opacity font-medium",
                className
              )}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        img: ({ alt }: any) => (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground italic border border-border/60 rounded px-1.5 py-0.5 my-1">
            📷 [Image: {alt || "External image suppressed"}]
          </span>
        ),
        table: ({ className, ...props }) => (
          <div className="my-2 w-full overflow-x-auto">
            <table
              className={cn(
                "w-full text-xs border border-border divide-y divide-border rounded-md",
                className
              )}
              {...props}
            />
          </div>
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn(
              "px-2.5 py-1.5 text-left font-medium bg-muted/50 text-muted-foreground border-b border-border text-[11px]",
              className
            )}
            {...props}
          />
        ),
        td: ({ className, ...props }) => (
          <td className={cn("px-2.5 py-1.5 border-t border-border/60", className)} {...props} />
        ),
        hr: ({ className, ...props }) => (
          <hr className={cn("border-border/60 my-3", className)} {...props} />
        ),
      }}
    />
  );
}
