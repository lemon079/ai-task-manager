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

const priorityConfig: Record<string, { dot: string; label: string }> = {
  high: { dot: "bg-rose-500", label: "High" },
  medium: { dot: "bg-amber-500", label: "Medium" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
  },
  over_due: {
    label: "Overdue",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
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
      toast.success(isCompleted ? "Marked as pending" : "Task completed");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <Checkbox
      checked={isCompleted}
      onCheckedChange={handleToggle}
      className="size-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors cursor-pointer"
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
      toast.success(isCompleted ? "Marked as pending" : "Task completed");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      router.refresh();
    } catch {
      toast.error("Failed to update status");
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
    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-md p-1 shadow-sm border-border text-xs">
          <DropdownMenuItem
            className="cursor-pointer text-xs"
            onClick={handleToggleComplete}
          >
            <CheckCircle2 className="mr-2 size-3.5 text-muted-foreground" />
            {isCompleted ? "Mark pending" : "Mark complete"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-xs text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 size-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const columns: ColumnDef<Task>[] = [
  // Checkbox
  {
    id: "select",
    header: () => <span className="sr-only">Status</span>,
    cell: ({ row }) => <StatusCheckbox task={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },

  // Task Name
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const isCompleted = row.original.status === "completed";
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "max-w-[200px] sm:max-w-xs truncate text-xs font-normal block",
                  isCompleted
                    ? "line-through text-muted-foreground/60"
                    : "text-foreground"
                )}
              >
                {title}
              </span>
            </TooltipTrigger>
            <TooltipContent className="rounded-md text-xs py-1 px-2">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  // Priority
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-2 h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        Priority <ArrowUpDown className="ml-1 size-3 text-muted-foreground/60" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = (row.getValue("priority") as string).toLowerCase();
      const config = priorityConfig[priority] || { dot: "bg-muted-foreground", label: priority };

      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
          <span>{config.label}</span>
        </div>
      );
    },
  },

  // Status
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-2 h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        Status <ArrowUpDown className="ml-1 size-3 text-muted-foreground/60" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || {
        label: status.replace("_", " "),
        className: "bg-muted text-muted-foreground",
      };

      return (
        <span
          className={cn(
            "inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium",
            config.className
          )}
        >
          {config.label}
        </span>
      );
    },
  },

  // Due Date
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-2 h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
      >
        Due Date <ArrowUpDown className="ml-1 size-3 text-muted-foreground/60" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDateValue = row.getValue("dueDate") as string;
      if (!dueDateValue) return <span className="text-muted-foreground text-xs">—</span>;

      const dueDate = new Date(dueDateValue);
      const formatted = format(dueDate, "MMM d, yyyy");
      const now = new Date();

      let colorClass = "text-muted-foreground";
      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        colorClass = "text-rose-600 dark:text-rose-400 font-medium";
      } else if (isToday(dueDate)) {
        colorClass = "text-amber-600 dark:text-amber-400 font-medium";
      }

      return <span className={cn("text-xs tabular-nums", colorClass)}>{formatted}</span>;
    },
  },

  // Actions (Revealed on row hover)
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TaskActions task={row.original} />,
  },
];
