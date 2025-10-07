import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import {
  createTaskSchema,
  deleteTaskSchema,
  fetchTasksSchema,
  searchTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";

// Create Task
const createTaskTool = tool(
  async ({
    title,
    userId,
    priority,
    dueDate,
  }: z.infer<typeof createTaskSchema>) => {
    const parsedDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.create({
      data: {
        title,
        userId,
        priority: priority || "medium",
        dueDate: parsedDate,
        status: "pending",
      },
    });

    return `Task created: ${task.title} with Priority: ${task.priority
    } and Status: ${task.status} by Due: ${
      task.dueDate ? task.dueDate.toDateString() : "No due date"
    }`;
    
  },
  {
    name: "create-task",
    description: `Create a task. Always provide priority exactly as 'low', 'medium', or 'high'. Always provide dueDate as YYYY-MM-DD.`,
    schema: createTaskSchema,
  }
);

// List Tasks by CreatedAt
const fetchTasksTool = tool(
  async ({
    userId,
    createdDate,
    dueDate,
    status,
    priority,
    title,
  }: z.infer<typeof fetchTasksSchema>) => {
    const where: any = { userId };

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by title (case-insensitive partial match)
    if (title) {
      where.title = { contains: title, mode: "insensitive" };
    }

    // Filter by created date (only date part)
    if (createdDate) {
      const from = new Date(`${createdDate}T00:00:00.000Z`);
      const to = new Date(`${createdDate}T23:59:59.999Z`);
      where.createdAt = { gte: from, lte: to };
    }

    // ✅ Filter by due date (only date part)
    if (dueDate) {
      const from = new Date(`${dueDate}T00:00:00.000Z`);
      const to = new Date(`${dueDate}T23:59:59.999Z`);
      where.dueDate = { gte: from, lte: to };
    }

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (tasks.length === 0) {
      return `No tasks found for the given filters.`;
    }

    return tasks
      .map(
        (t) =>
          `• ${t.title} | ${t.status} | ${t.priority} | Created: ${t.createdAt.toDateString()} | Due: ${
            t.dueDate ? t.dueDate.toDateString() : "No due date"
          }`
      )
      .join("\n");
  },
  {
    name: "fetch-tasks",
    description:
      "Fetch tasks for a user. Supports filtering by createdDate, dueDate, status, priority, title, or any combination. Dates should be in YYYY-MM-DD format.",
    schema: fetchTasksSchema,
  }
);


// Update Task (✅ Fixed with ID support & disambiguation)
const updateTaskTool = tool(
  async ({
    id,
    title,
    priority,
    status,
    dueDate,
    userId,
  }: z.infer<typeof updateTaskSchema>) => {
    let task;

    if (id) {
      // ✅ Update by ID
      task = await prisma.task.update({
        where: { id },
        data: {
          ...(priority && { priority }),
          ...(status && { status }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });
    } else if (title) {
      // ✅ Try direct update by title
      const matches = await prisma.task.findMany({
        where: {
          title: { contains: title, mode: "insensitive" },
          ...(userId && { userId }),
        },
      });

      if (matches.length === 0) {
        return `❌ No task found with title containing "${title}".`;
      }

      if (matches.length > 1) {
        return `⚠️ Multiple tasks found:\n${matches
          .map((t) => `• ${t.id} | ${t.title}`)
          .join("\n")}\n\nPlease retry with the task ID.`;
      }

      task = await prisma.task.update({
        where: { id: matches[0].id },
        data: {
          ...(priority && { priority }),
          ...(status && { status }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });
    } else {
      return "❌ You must provide either an ID or a title to update a task.";
    }

    return `✏️ Task "${task.title}" was updated successfully. 
Priority: ${task.priority}, Status: ${task.status}, Due: ${
      task.dueDate ? task.dueDate.toDateString() : "No due date"
    }.`;
  },
  {
    name: "update-task",
    description: `
      Update a task by ID or title (case-insensitive).
      Can update priority, status, and due date.
      If multiple tasks are found with the same title, user must clarify by ID.`,
    schema: updateTaskSchema,
  }
);

// Delete Task
const deleteTaskTool = tool(
  async ({ id }: z.infer<typeof deleteTaskSchema>) => {
    const deleted = await prisma.task.delete({ where: { id } });
    return `🗑️ Task deleted: ${deleted.title} | Priority: ${deleted.priority} | Status: ${deleted.status}`;
  },
  {
    name: "delete-task",
    description:
      "Delete a task by ID (returns deleted details incl. priority/status)",
    schema: deleteTaskSchema,
  }
);

// Search Task
const searchTaskTool = tool(
  async ({ query, userId }: z.infer<typeof searchTaskSchema>) => {
    const tasks = await prisma.task.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        userId,
      },
      select: { id: true, title: true },
    });

    if (tasks.length === 0) return `❌ No tasks found for "${query}".`;

    return tasks
      .map((t) => `• task id: ${t.id} | Title: ${t.title}`)
      .join("\n");
  },
  {
    name: "searchTask",
    description: "Search tasks by title keyword",
    schema: searchTaskSchema,
  }
);

// Get Current Date
const getCurrentDate = tool(
  async () => {
    return new Date().toISOString();
  },
  {
    name: "get-current-date",
    description: "Returns the current date and time in ISO 8601 format.",
  }
);

export const taskTools = [
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  fetchTasksTool,
  searchTaskTool,
  getCurrentDate,
];
