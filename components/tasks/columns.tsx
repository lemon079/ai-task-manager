"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { priorityColors } from "@/types/util-types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Task>[] = [
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
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              console.log("Edit", row.original);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              console.log("Delete", row.original);
            }}
          >
            Delete
          </DropdownMenuItem>
          {/* Add more actions if needed */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
