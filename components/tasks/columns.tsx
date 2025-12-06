"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isBefore, isToday } from "date-fns";
import { deleteTask } from "@/lib/actions/task";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Checkbox } from "../ui/checkbox";

const priorityConfig: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-red-100", text: "text-red-700" },
  medium: { bg: "bg-amber-100", text: "text-amber-700" },
  low: { bg: "bg-green-100", text: "text-green-700" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-slate-100", text: "text-slate-600" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  over_due: { bg: "bg-red-100", text: "text-red-700" },
};

export const columns: ColumnDef<Task>[] = [
  // Status Checkbox Column
  {
    id: "select",
    header: () => <span className="sr-only">Status</span>,
    cell: ({ row }) => {
      const isCompleted = row.original.status === "completed";
      return (
        <Checkbox
          checked={isCompleted}
          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          aria-label="Mark as complete"
        />
      );
    },
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
              <div className={`max-w-[200px] truncate font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {title}
              </div>
            </TooltipTrigger>
            <TooltipContent>
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
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-4"
      >
        Priority <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const priority = (row.getValue("priority") as string).toLowerCase();
      const config = priorityConfig[priority] || { bg: "bg-slate-100", text: "text-slate-600" };

      return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-4"
      >
        Status <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || { bg: "bg-slate-100", text: "text-slate-600" };
      const label = status.replace("_", " ");

      return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${config.bg} ${config.text}`}>
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
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer -ml-4"
      >
        Due Date <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDateValue = row.getValue("dueDate") as string;
      if (!dueDateValue) return <span className="text-muted-foreground">—</span>;

      const dueDate = new Date(dueDateValue);
      const formatted = format(dueDate, "MMM dd, yyyy");
      const now = new Date();

      let colorClass = "text-muted-foreground";
      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        colorClass = "text-red-600 font-medium";
      } else if (isToday(dueDate)) {
        colorClass = "text-amber-600 font-medium";
      } else {
        colorClass = "text-green-600";
      }

      return <span className={`text-sm ${colorClass}`}>{formatted}</span>;
    },
  },

  // Actions Column
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0 hover:bg-muted">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer">
            <CheckCircle2 className="mr-2 size-4" /> Mark Complete
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Pencil className="mr-2 size-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => deleteTask(row.original)}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
