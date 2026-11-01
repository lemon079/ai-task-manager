"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { CheckCircle2, Clock, Calendar, Tag, AlertCircle } from "lucide-react";

interface CreateTaskArgs {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

interface TaskResult {
  success: boolean;
  message?: string;
  taskId?: string;
}

export const CreateTaskToolUI = makeAssistantToolUI<CreateTaskArgs, TaskResult>({
  toolName: "create_task",
  render: ({ args, result, status }) => {
    const isRunning = status.type === "running";
    const priorityColor =
      args.priority === "high"
        ? "text-red-600 bg-red-500/10 border-red-500/20"
        : args.priority === "medium"
        ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
        : "text-blue-600 bg-blue-500/10 border-blue-500/20";

    return (
      <div className="my-2.5 p-3.5 rounded-xl border border-border bg-card/80 shadow-xs max-w-md animate-in fade-in-50 duration-150">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-border/50">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            {isRunning ? (
              <Clock className="size-3.5 text-amber-500 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5 text-green-500" />
            )}
            {isRunning ? "Creating Task..." : "Task Created"}
          </span>
          {args.priority && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border capitalize ${priorityColor}`}
            >
              {args.priority}
            </span>
          )}
        </div>

        <div className="pt-2 text-sm">
          <p className="font-semibold text-foreground truncate">{args.title}</p>
          {args.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {args.description}
            </p>
          )}

          {args.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <Calendar className="size-3 text-primary" />
              <span>Due: {args.dueDate}</span>
            </div>
          )}
        </div>

        {result && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
            <span>✓</span> {result.message || "Task saved to database"}
          </p>
        )}
      </div>
    );
  },
});
