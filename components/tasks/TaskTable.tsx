"use client";

import React from "react";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";
import { Task } from "@prisma/client";
import PullToRefresh from "./PullToRefresh";

const TaskTable = ({ tasks, isDashboard }: { tasks: Task[]; isDashboard?: boolean }) => {
  return (
    <PullToRefresh>
      <div className="mt-4 rounded-md">
        <DataTable columns={columns} data={tasks} isDashboard={isDashboard} />
      </div>
    </PullToRefresh>
  );
};

export default TaskTable;