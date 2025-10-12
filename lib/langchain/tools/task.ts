// src/lib/langchain/tools/taskTools.ts
import { tool } from "@langchain/core/tools";
import {
  createTask,
  fetchTasks,
  updateTask,
  searchTask,
  deleteTaskCoreTool,
} from "@/lib/actions/task";
import type { Task } from "@prisma/client";
import {
  createTaskSchema,
  deleteTaskSchema,
  fetchTasksSchema,
  searchTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";
import { DateTime } from "luxon";

/* ---------------------------
   Formatting helpers (for agent-friendly text)
   --------------------------- */

function formatDate(d: Date | null | undefined) {
  if (!d) return "No due date";
  try {
    return d.toDateString();
  } catch {
    return String(d);
  }
}

function formatTaskSummary(t: Task) {
  return `${t.title} | ${t.status} | ${
    t.priority
  } | Created: ${t.createdAt.toDateString()} | Due: ${formatDate(t.dueDate)}`;
}

/** Create Task tool - formats created task for agent */
const createTaskTool = tool(
  async (args: Parameters<typeof createTask>[0]) => {
    const task = await createTask(args);
    return `Task created: ${formatTaskSummary(task)}`;
  },
  {
    name: "create-task",
    description: `Create a task. Always provide priority exactly as 'low', 'medium', or 'high'. Always provide dueDate as YYYY-MM-DD.`,
    schema: createTaskSchema,
  }
);

/** Fetch Tasks tool */
const fetchTasksTool = tool(
  async (args: Parameters<typeof fetchTasks>[0]) => {
    const tasks = await fetchTasks(args);

    if (!tasks || tasks.length === 0) {
      return `No tasks found for the given filters.`;
    }

    return tasks.map((t) => `• ${formatTaskSummary(t)}`).join("\n");
  },
  {
    name: "fetch-tasks",
    description:
      "Fetch tasks for a user. Supports filtering by createdDate, dueDate, status, priority, title, or any combination. Dates should be in YYYY-MM-DD format.",
    schema: fetchTasksSchema,
  }
);

/** Update Task tool */
const updateTaskTool = tool(
  async (args: Parameters<typeof updateTask>[0]) => {
    try {
      const task = await updateTask(args);
      return `Task updated: ${formatTaskSummary(task)}`;
    } catch (err: any) {
      // Preserve error messages so agent can react (e.g. disambiguation)
      return `Error: ${err.message || String(err)}`;
    }
  },
  {
    name: "update-task",
    description: `
     Update a user's task by ID or title. 
      Can modify title, priority, status, and due date. 
      Always include 'userId' to scope the update.`,
    schema: updateTaskSchema,
  }
);

/** Delete Task tool */
const deleteTaskTool = tool(
  async (args: Parameters<typeof deleteTaskCoreTool>[0]) => {
    const deleted = await deleteTaskCoreTool(args);
    return `Task deleted: ${formatTaskSummary(deleted)}`;
  },
  {
    name: "delete-task",
    description:
      "Delete a task by ID (returns deleted details incl. priority/status)",
    schema: deleteTaskSchema,
  }
);

/** Search Task tool */
const searchTaskTool = tool(
  async (args: Parameters<typeof searchTask>[0]) => {
    const results = await searchTask(args);
    if (!results || results.length === 0)
      return `❌ No tasks found for "${args.query}".`;
    return results
      .map((t) => `• task id: ${t.id} | Title: ${t.title}`)
      .join("\n");
  },
  {
    name: "searchTask",
    description: "Search tasks by title keyword",
    schema: searchTaskSchema,
  }
);

/** Get Current Date tool */
export const getCurrentDateTool = tool(
  () => {
    // Use Luxon to get the current date and time in ISO 8601 format
    const now = DateTime.now().setZone("UTC").toISO(); // or .setZone("Asia/Karachi") if you want local
    return now;
  },
  {
    name: "get-current-date",
    description:
      "Returns the current date and time in ISO 8601 format (e.g., 2025-10-12T10:45:00.000Z).",
  }
);

export const taskTools = [
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  fetchTasksTool,
  searchTaskTool,
  getCurrentDateTool,
];
