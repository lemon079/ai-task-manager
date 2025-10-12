"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isBefore, isToday } from "date-fns";
import { deleteTask } from "@/lib/actions/task";

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-300",
  MEDIUM: "bg-yellow-300",
  LOW: "bg-green-300",
};

export const columns: ColumnDef<Task>[] = [
  // 🆔 Task ID Column
  {
    accessorKey: "title",
    header: "Title",
  },

  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        Priority <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const pr = (row.getValue("priority") as string).toUpperCase();
      const colorClass =
        pr in priorityColors
          ? `${priorityColors[pr]} bg-opacity-20 text-opacity-90`
          : "bg-gray-100 text-gray-600";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${colorClass}`}
          onClick={() => {
            table.getColumn("priority")?.setFilterValue(pr);
          }}
        >
          {pr.charAt(0) + pr.slice(1).toLowerCase()}
        </span>
      );
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        Status <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const st = row.getValue("status") as string;
      const colorClass =
        st === "completed"
          ? "bg-green-100 text-green-600"
          : st === "in_progress"
            ? "bg-blue-100 text-blue-600"
            : "bg-gray-100 text-gray-600";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${colorClass}`}
          onClick={() => {
            table.getColumn("status")?.setFilterValue(st);
          }}
        >
          {st.charAt(0).toUpperCase() + st.slice(1).replace("_", " ")}
        </span>
      );
    },
  },

  // 📅 Due Date Column
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        Due Date <ArrowUpDown className="ml-1 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dueDateValue = row.getValue("dueDate") as string;
      if (!dueDateValue) return <span className="text-gray-400">—</span>;

      const dueDate = new Date(dueDateValue);
      const formatted = format(dueDate, "MMM dd, yyyy");
      const now = new Date();

      let colorClass = "text-gray-600";
      if (isBefore(dueDate, now) && !isToday(dueDate)) {
        colorClass = "text-red-500 font-medium"; // overdue
      } else if (isToday(dueDate)) {
        colorClass = "text-yellow-600 font-medium"; // due today
      } else {
        colorClass = "text-green-600"; // upcoming
      }

      return (
        <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
          {formatted}
        </div>
      );
    },
  },

  // ⚙️ Actions Column
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              deleteTask(row.original);
            }}
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
