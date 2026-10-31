"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal, Trash2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isBefore, isToday } from "date-fns";
import { deleteTask, updateTask } from "@/lib/actions/task";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const priorityConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  high: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/25",
    dot: "bg-rose-500",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/25",
    dot: "bg-amber-500",
  },
  low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
  },
};

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/25",
    dot: "bg-slate-400",
  },
  in_progress: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/25",
    dot: "bg-sky-500",
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  over_due: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/25",
    dot: "bg-rose-500",
  },
};

function StatusCheckbox({ task }: { task: Task }) {
  const isCompleted = task.status === "completed";
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleToggle = async () => {
    try {
      const nextStatus = isCompleted ? "pending" : "completed";
      await updateTask({
        id: task.id,
        status: nextStatus,
        userId: task.userId,
      });
      toast.success(isCompleted ? "Task marked pending" : "Task completed!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.refresh();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  return (
    <Checkbox
      checked={isCompleted}
      onCheckedChange={handleToggle}
      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md cursor-pointer transition-colors"
      aria-label="Mark as complete"
    />
  );
}

function TaskActions({ task }: { task: Task }) {
  const isCompleted = task.status === "completed";
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleToggleComplete = async () => {
    try {
      const nextStatus = isCompleted ? "pending" : "completed";
      await updateTask({
        id: task.id,
        status: nextStatus,
        userId: task.userId,
      });
      toast.success(isCompleted ? "Task marked pending" : "Task marked complete!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.refresh();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask({ id: task.id });
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.refresh();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-lg">
        <DropdownMenuItem
          className="cursor-pointer rounded-lg text-xs font-medium"
          onClick={handleToggleComplete}
        >
          <CheckCircle2 className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
          {isCompleted ? "Mark Pending" : "Mark Complete"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-lg text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 size-4" /> Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Task>[] = [
  // Status Checkbox Column
  {
    id: "select",
    header: () => <span className="sr-only">Status</span>,
    cell: ({ row }) => <StatusCheckbox task={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },

  // Task Name Column
  {
    accessorKey: "title",
    header: "Task Name",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const isCompleted = row.original.status === "completed";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "max-w-[220px] sm:max-w-xs truncate font-medium text-sm transition-colors",
                  isCompleted
                    ? "line-through text-muted-foreground/60"
                    : "text-foreground"
                )}
              >
                {title}
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg text-xs">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // Priority Badge Column
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Priority <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = (row.getValue("priority") as string).toLowerCase();
      const config =
        priorityConfig[priority] || {
          bg: "bg-slate-500/10",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-500/20",
          dot: "bg-slate-400",
        };

      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
            config.bg,
            config.text,
            config.border
          )}
        >
          <span className={cn("size-1.5 rounded-full", config.dot)} />
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
      );
    },
  },

  // Status Column
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Status <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config =
        statusConfig[status] || {
          bg: "bg-slate-500/10",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-500/20",
          dot: "bg-slate-400",
        };
      const label = status.replace("_", " ");

      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
            config.bg,
            config.text,
            config.border
          )}
        >
          <span className={cn("size-1.5 rounded-full", config.dot)} />
          {label}
        </span>
      );
    },
  },

  // Due Date Column
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Due Date <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDateValue = row.getValue("dueDate") as string;
      if (!dueDateValue) return <span className="text-muted-foreground text-xs">—</span>;

      const dueDate = new Date(dueDateValue);
      const formatted = format(dueDate, "MMM dd, yyyy");
      const now = new Date();

      let colorClass = "text-muted-foreground";
      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        colorClass = "text-rose-600 dark:text-rose-400 font-semibold";
      } else if (isToday(dueDate)) {
        colorClass = "text-amber-600 dark:text-amber-400 font-semibold";
      } else {
        colorClass = "text-emerald-600 dark:text-emerald-400 font-medium";
      }

      return <span className={cn("text-xs font-medium tabular-nums", colorClass)}>{formatted}</span>;
    },
  },

  // Actions Column
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TaskActions task={row.original} />,
  },
];
