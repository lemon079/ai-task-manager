import { tool } from "@langchain/core/tools";
import type { Task } from "@prisma/client";
import {
  createTaskSchema,
  deleteTaskSchema,
  fetchTasksSchema,
  searchTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";
import { DateTime } from "luxon";
import { prisma } from "@/prisma/prisma";
import z from "zod";
import {
  createTaskEmbedding,
  searchTaskEmbeddings,
  deleteTaskEmbedding,
  updateTaskEmbedding,
} from "@/lib/langchain/embeddings/crud";

/* ---------------------------
   Formatting helpers
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
  return `${t.title} | ${t.status} | ${t.priority
    } | Created: ${t.createdAt.toDateString()} | Due: ${formatDate(t.dueDate)}`;
}

/** ----------------------------
 * CREATE TASK TOOL
 * ---------------------------- */
const createTaskTool = tool(
  async (args) => {
    const { title, description, userId, priority, dueDate } = args;
    const parsedDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId,
        priority: priority ?? "medium",
        dueDate: parsedDate,
        status: "pending",
      },
    });

    // 🔹 Silent embedding sync
    createTaskEmbedding(task).catch((err) =>
      console.error("Embedding index failed:", err)
    );

    return `✅ Task created: ${task.title}`;
  },
  {
    name: "create-task",
    description: `Create a task. Always provide priority exactly as 'low', 'medium', or 'high'. Always provide dueDate as YYYY-MM-DD. Optionally include a description.`,
    schema: createTaskSchema,
  }
);

/** ----------------------------
 * FETCH TASKS TOOL
 * ---------------------------- */
const fetchTasksTool = tool(
  async (args: z.infer<typeof fetchTasksSchema>) => {
    const { userId, createdDate, dueDate, status, priority, title } = args;
    const where: any = { userId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (title) where.title = { contains: title, mode: "insensitive" };

    if (createdDate) {
      const from = new Date(`${createdDate}T00:00:00.000Z`);
      const to = new Date(`${createdDate}T23:59:59.999Z`);
      where.createdAt = { gte: from, lte: to };
    }

    if (dueDate) {
      const from = new Date(`${dueDate}T00:00:00.000Z`);
      const to = new Date(`${dueDate}T23:59:59.999Z`);
      where.dueDate = { gte: from, lte: to };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return tasks.map((t) => `• ${formatTaskSummary(t)}`).join("\n");
  },
  {
    name: "fetch-tasks",
    description:
      "Fetch tasks for a user. Supports filtering by createdDate, dueDate, status, priority, title, or any combination. Dates should be in YYYY-MM-DD format.",
    schema: fetchTasksSchema,
  }
);

/** ----------------------------
 * UPDATE TASK TOOL
 * ---------------------------- */
const updateTaskTool = tool(
  async (args) => {
    const { newTitle, id, title, description, priority, status, dueDate, userId } = args;
    let task: Task | null = null;

    // Update by ID if provided
    if (id) {
      task = await prisma.task.findUnique({ where: { id } });

      if (!task) {
        return `❌ No task found with ID: ${id}`;
      }

      task = await prisma.task.update({
        where: { id },
        data: {
          ...(newTitle && { title: newTitle }),
          ...(description !== undefined && { description }),
          ...(priority && { priority }),
          ...(status && { status }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });

      updateTaskEmbedding(task).catch((err) =>
        console.error("Embedding update failed:", err)
      );

      return `✅ Task updated: ${task.title}`;
    }

    // Update by title if ID is not provided
    if (title) {
      const matchingTasks = await prisma.task.findMany({
        where: {
          userId,
          title: { contains: title, mode: "insensitive" },
        },
      });

      if (matchingTasks.length === 0) {
        return `❌ No task found matching title: "${title}"`;
      }

      if (matchingTasks.length > 1) {
        const taskList = matchingTasks
          .map((t) => `• ${t.title} (ID: ${t.id})`)
          .join("\n");
        return `⚠️ Multiple tasks found matching "${title}". Please specify the ID:\n${taskList}`;
      }

      task = await prisma.task.update({
        where: { id: matchingTasks[0].id },
        data: {
          ...(newTitle && { title: newTitle }),
          ...(description !== undefined && { description }),
          ...(priority && { priority }),
          ...(status && { status }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
        },
      });

      updateTaskEmbedding(task).catch((err) =>
        console.error("Embedding update failed:", err)
      );

      return `✅ Task updated: ${task.title}`;
    }

    return `❌ Please provide either an 'id' or 'title' to identify the task.`;
  },
  {
    name: "update-task",
    description: `
     Update a user's task by ID or title. 
      Can modify title, description, priority, status, and due date. 
      Always include 'userId' to scope the update.`,
    schema: updateTaskSchema,
  }
);

/** ----------------------------
 * DELETE TASK TOOL
 * ---------------------------- */
export const deleteTaskTool = tool(
  async ({ query, userId }: z.infer<typeof deleteTaskSchema>) => {
    // Step 1: Find the most relevant task using embeddings
    const results = await searchTaskEmbeddings(query, 3);
    const filtered = results.filter(
      (r) => !userId || r.metadata?.userId === userId
    );

    if (!filtered.length) return "No related tasks found to delete.";

    const bestMatch = filtered[0];
    const taskId = bestMatch.id;
    const title = bestMatch.metadata?.title;

    // Step 2: Delete from the database
    await prisma.task.delete({ where: { id: taskId } });

    // Step 3: Optionally delete its embedding too
    await deleteTaskEmbedding(taskId);

    return `✅ Deleted task: "${title}"`;
  },
  {
    name: "delete-task",
    description:
      "Deletes a task based on a natural language query using embeddings. The most semantically similar task will be deleted.",
    schema: deleteTaskSchema,
  }
);
// What tasks do I have related to improving the dashboard UI?

/** ----------------------------
 * SEARCH TASK TOOL (Semantic)
 * ---------------------------- */
export const searchTaskTool = tool(
  async (args: z.infer<typeof searchTaskSchema>) => {
    const { query, userId } = args;

    // ✅ Use the refactored embedding search function
    const results = await searchTaskEmbeddings(query, 5);

    // Optionally filter results by userId if metadata contains it
    const filtered = results.filter(
      (r) => !userId || r.metadata?.userId === userId
    );

    if (!filtered.length) return "No related tasks found.";

    // Return a formatted string for the agent
    return filtered
      .map(
        (m) =>
          `• ${m.metadata?.title} (${m.metadata?.status}, ${m.metadata?.priority})`
      )
      .join("\n");
  },
  {
    name: "search-task",
    description:
      "Search for tasks semantically (by meaning) using embeddings. Returns the most relevant results.",
    schema: searchTaskSchema,
  }
);

/** ----------------------------
 * GET CURRENT DATE TOOL
 * ---------------------------- */
const getCurrentDateTool = tool(() => DateTime.now().setZone("UTC").toISO(), {
  name: "get-current-date",
  description:
    "Returns the current date and time in ISO 8601 format (e.g., 2025-10-12T10:45:00.000Z). ",
});

/* ----------------------------
   Export all task tools
---------------------------- */
export const taskTools = [
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  fetchTasksTool,
  searchTaskTool,
  getCurrentDateTool,
];
