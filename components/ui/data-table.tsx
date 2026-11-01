"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isDashboard?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isDashboard,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  return (
    <div className="rounded-md border border-border/80 bg-card overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border/80 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-9 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-border/60">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group h-10 hover:bg-muted/40 transition-colors border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="block md:hidden divide-y divide-border/60">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const selectCell = row.getVisibleCells().find((c) => c.column.id === "select");
            const titleCell = row.getVisibleCells().find((c) => c.column.id === "title");
            const priorityCell = row.getVisibleCells().find((c) => c.column.id === "priority");
            const statusCell = row.getVisibleCells().find((c) => c.column.id === "status");
            const dueDateCell = row.getVisibleCells().find((c) => c.column.id === "dueDate");
            const actionsCell = row.getVisibleCells().find((c) => c.column.id === "actions");

            return (
              <div key={row.id} className="p-3 space-y-2 bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {selectCell && (
                      <div className="shrink-0 -mt-0.5">
                        {flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 leading-tight">
                      {titleCell && flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
                    </div>
                  </div>
                  {actionsCell && (
                    <div className="shrink-0 -mt-1">
                      {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground pl-9">
                  {priorityCell && (
                    <div>{flexRender(priorityCell.column.columnDef.cell, priorityCell.getContext())}</div>
                  )}
                  {statusCell && (
                    <div>{flexRender(statusCell.column.columnDef.cell, statusCell.getContext())}</div>
                  )}
                  {dueDateCell && (
                    <div className="ml-auto text-xs">
                      {flexRender(dueDateCell.column.columnDef.cell, dueDateCell.getContext())}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No tasks found
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {isDashboard && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-card">
          <div className="text-[11px] text-muted-foreground tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
