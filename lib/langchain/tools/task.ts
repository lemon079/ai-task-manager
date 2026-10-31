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
import { logger } from "@/lib/logger";
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
    return d.toISOString().split("T")[0];
  } catch {
    return String(d);
  }
}

function formatTaskSummary(t: Task) {
  return `<task title="${t.title}" status="${t.status}" priority="${t.priority}" created="${formatDate(
    t.createdAt
  )}" due="${formatDate(t.dueDate)}" />`;
}

/**
 * Creates tenant-scoped tools bound to the authenticated user's session.
 * userId is NEVER accepted from LLM arguments; it is enclosed in this factory.
 */
export function createTaskTools(userId: string) {
  if (!userId) {
    throw new Error("createTaskTools requires a valid, authenticated userId.");
  }

  /** ----------------------------
   * CREATE TASK TOOL
   * ---------------------------- */
  const createTaskTool = tool(
    async (args: z.infer<typeof createTaskSchema>) => {
      const { title, description, priority, dueDate } = args;

      // 1. Concurrency / Idempotency check: Debounce identical task creation within 5 seconds
      const recentWindow = new Date(Date.now() - 5000);
      const existingRecent = await prisma.task.findFirst({
        where: {
          userId,
          title: { equals: title, mode: "insensitive" },
          createdAt: { gte: recentWindow },
        },
      });

      if (existingRecent) {
        return JSON.stringify({
          success: true,
          action: "create",
          message: `Task "${existingRecent.title}" was already created recently.`,
          task: {
            id: existingRecent.id,
            title: existingRecent.title,
            priority: existingRecent.priority,
            status: existingRecent.status,
            dueDate: formatDate(existingRecent.dueDate),
          },
        });
      }

      // 2. Parse due date safely
      let parsedDate: Date | null = null;
      if (dueDate) {
        const d = new Date(dueDate);
        if (!isNaN(d.getTime())) {
          parsedDate = d;
        }
      }

      // 3. Create task in Postgres scoped by userId
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          userId,
          priority: priority ?? "medium",
          dueDate: parsedDate,
          status: "pending",
        },
      });

      // 4. Audit mutation and index embedding in tenant-isolated Pinecone namespace
      logger.auditMutation({
        action: "CREATE",
        taskId: task.id,
        userId,
        title: task.title,
      });

      try {
        await createTaskEmbedding(task, userId);
      } catch (err) {
        console.warn("[EMBEDDING_INDEX_WARN] Failed to index task immediately:", err);
      }

      return JSON.stringify({
        success: true,
        action: "create",
        message: `Task created: ${task.title}`,
        task: {
          id: task.id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: formatDate(task.dueDate),
        },
      });
    },
    {
      name: "create_task",
      description:
        "Create a new task. Provide title, priority ('low', 'medium', or 'high'), and dueDate (YYYY-MM-DD or ISO string).",
      schema: createTaskSchema,
    }
  );

  /** ----------------------------
   * FETCH TASKS TOOL
   * ---------------------------- */
  const fetchTasksTool = tool(
    async (args: z.infer<typeof fetchTasksSchema>) => {
      const { createdDate, dueDate, status, priority, title } = args;
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
        take: 20,
      });

      if (!tasks.length) {
        return "No tasks found matching the criteria.";
      }

      // Wrap in untrusted data tags so prompt injection attempts inside task titles cannot act as commands
      const taskList = tasks.map((t) => formatTaskSummary(t)).join("\n");
      return `<untrusted_task_data>\n${taskList}\n</untrusted_task_data>`;
    },
    {
      name: "fetch_tasks",
      description:
        "Fetch tasks for the authenticated user. Supports filtering by createdDate, dueDate, status, priority, or title.",
      schema: fetchTasksSchema,
    }
  );

  /** ----------------------------
   * UPDATE TASK TOOL
   * ---------------------------- */
  const updateTaskTool = tool(
    async (args: z.infer<typeof updateTaskSchema>) => {
      const { id, title, newTitle, description, priority, status, dueDate } = args;
      let targetTask: Task | null = null;

      // 1. Locate by exact ID scoped by userId
      if (id) {
        targetTask = await prisma.task.findFirst({
          where: { id, userId },
        });

        if (!targetTask) {
          return JSON.stringify({
            success: false,
            action: "update",
            error: "No task found matching the specified identifier.",
          });
        }
      }

      // 2. Locate by title scoped by userId
      if (!targetTask && title) {
        const matches = await prisma.task.findMany({
          where: {
            userId,
            title: { contains: title, mode: "insensitive" },
          },
          take: 10,
        });

        if (matches.length === 0) {
          return JSON.stringify({
            success: false,
            action: "update",
            error: `No task found matching title: "${title}".`,
          });
        }

        // Ambiguity check: If multiple tasks match, do NOT pick one arbitrarily!
        if (matches.length > 1) {
          const candidates = matches.map(
            (t) => `• "${t.title}" | Status: ${t.status} | Due: ${formatDate(t.dueDate)}`
          ).join("\n");

          return JSON.stringify({
            success: false,
            multipleMatches: true,
            action: "update",
            message: `Multiple tasks match "${title}". Ask the user which one to update from the candidates:\n${candidates}`,
          });
        }

        targetTask = matches[0];
      }

      if (!targetTask) {
        return JSON.stringify({
          success: false,
          action: "update",
          error: "Please provide either a title or reference to identify the task to update.",
        });
      }

      // 3. Perform update strictly scoped to targetTask.id and userId
      let parsedDueDate: Date | undefined = undefined;
      if (dueDate) {
        const d = new Date(dueDate);
        if (!isNaN(d.getTime())) {
          parsedDueDate = d;
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id: targetTask.id },
        data: {
          ...(newTitle && { title: newTitle }),
          ...(description !== undefined && { description }),
          ...(priority && { priority }),
          ...(status && { status }),
          ...(parsedDueDate !== undefined && { dueDate: parsedDueDate }),
        },
      });

      // 4. Audit mutation and synchronize vector embedding in tenant namespace
      logger.auditMutation({
        action: "UPDATE",
        taskId: updatedTask.id,
        userId,
        title: updatedTask.title,
        changes: { newTitle, priority, status, dueDate },
      });

      try {
        await updateTaskEmbedding(updatedTask, userId);
      } catch (err) {
        console.warn("[EMBEDDING_UPDATE_WARN] Failed to update task embedding:", err);
      }

      return JSON.stringify({
        success: true,
        action: "update",
        message: `Task updated: ${updatedTask.title}`,
        task: {
          id: updatedTask.id,
          title: updatedTask.title,
          priority: updatedTask.priority,
          status: updatedTask.status,
          dueDate: formatDate(updatedTask.dueDate),
        },
      });
    },
    {
      name: "update_task",
      description:
        "Update an existing task. Specify id or title to identify the task. If multiple matches are found, the tool returns candidate descriptions for clarification.",
      schema: updateTaskSchema,
    }
  );

  /** ----------------------------
   * DELETE TASK TOOL
   * ---------------------------- */
  const deleteTaskTool = tool(
    async (args: z.infer<typeof deleteTaskSchema>) => {
      const { id, query, confirmed } = args;
      let taskToDelete: Task | null = null;

      // 1. Direct ID match scoped by userId
      if (id) {
        taskToDelete = await prisma.task.findFirst({
          where: { id, userId },
        });
      }

      // 2. Direct ID or title match by query
      if (!taskToDelete && query) {
        // Check if query is directly an exact ID
        const idMatch = await prisma.task.findFirst({
          where: { id: query, userId },
        });
        if (idMatch) {
          taskToDelete = idMatch;
        }
      }

      // 3. Search by title text scoped by userId
      if (!taskToDelete && query) {
        const matchingTasks = await prisma.task.findMany({
          where: {
            userId,
            title: { contains: query, mode: "insensitive" },
          },
          take: 5,
        });

        if (matchingTasks.length > 1) {
          const candidates = matchingTasks.map(
            (t) => `• "${t.title}" | Status: ${t.status} | Due: ${formatDate(t.dueDate)}`
          ).join("\n");

          return JSON.stringify({
            success: false,
            multipleMatches: true,
            action: "delete",
            message: `Multiple tasks found matching "${query}". Ask the user which one they wish to delete:\n${candidates}`,
          });
        }

        if (matchingTasks.length === 1) {
          taskToDelete = matchingTasks[0];
        }
      }

      // 4. Semantic fallback search scoped by userId
      if (!taskToDelete && query) {
        try {
          const semResults = await searchTaskEmbeddings(query, 3, userId);
          if (semResults.length === 1) {
            taskToDelete = await prisma.task.findFirst({
              where: { id: semResults[0].id, userId },
            });
          } else if (semResults.length > 1) {
            const candidates = semResults.map(
              (r) => `• "${r.metadata?.title}" | Status: ${r.metadata?.status}`
            ).join("\n");

            return JSON.stringify({
              success: false,
              multipleMatches: true,
              action: "delete",
              message: `Multiple related tasks found for "${query}". Ask the user which one to delete:\n${candidates}`,
            });
          }
        } catch (err) {
          console.warn("[DELETE_SEMANTIC_SEARCH_WARN]", err);
        }
      }

      if (!taskToDelete) {
        return JSON.stringify({
          success: false,
          action: "delete",
          error: `No matching task found to delete for "${query || id}".`,
        });
      }

      // 5. Destructive Action Guardrail: Require confirmation for deletion
      if (!confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          action: "delete",
          message: `Please confirm: Are you sure you want to delete the task "${taskToDelete.title}"?`,
          task: {
            id: taskToDelete.id,
            title: taskToDelete.title,
            status: taskToDelete.status,
            dueDate: formatDate(taskToDelete.dueDate),
          },
        });
      }

      // 6. Delete strictly scoped by task ID
      await prisma.task.delete({
        where: { id: taskToDelete.id },
      });

      // 7. Audit mutation and remove vector embedding from user namespace
      logger.auditMutation({
        action: "DELETE",
        taskId: taskToDelete.id,
        userId,
        title: taskToDelete.title,
      });

      try {
        await deleteTaskEmbedding(taskToDelete.id, userId);
      } catch (err) {
        console.warn("[EMBEDDING_DELETE_WARN] Failed to delete embedding:", err);
      }

      return JSON.stringify({
        success: true,
        action: "delete",
        message: `Task deleted: "${taskToDelete.title}"`,
        task: {
          id: taskToDelete.id,
          title: taskToDelete.title,
          status: taskToDelete.status,
        },
      });
    },
    {
      name: "delete_task",
      description:
        "Deletes a task by id or title. If multiple tasks match, returns candidates to ask user. Requires confirmation before deletion.",
      schema: deleteTaskSchema,
    }
  );

  /** ----------------------------
   * SEARCH TASK TOOL (Semantic with Tenant Isolation)
   * ---------------------------- */
  const searchTaskTool = tool(
    async (args: z.infer<typeof searchTaskSchema>) => {
      const { query } = args;

      try {
        // Search strictly inside the user's Pinecone namespace
        const results = await searchTaskEmbeddings(query, 5, userId);

        if (results.length > 0) {
          const hits = results.map(
            (m) =>
              `<task title="${m.metadata?.title || "Untitled"}" status="${m.metadata?.status || "pending"}" priority="${m.metadata?.priority || "medium"}" />`
          ).join("\n");

          return `<untrusted_task_data>\n${hits}\n</untrusted_task_data>`;
        }
      } catch (err) {
        console.warn("[SEMANTIC_SEARCH_WARN] Falling back to database keyword search:", err);
      }

      // Fallback to Prisma database search scoped by userId
      const dbTasks = await prisma.task.findMany({
        where: {
          userId,
          title: { contains: query, mode: "insensitive" },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (!dbTasks.length) {
        return "No related tasks found.";
      }

      const dbList = dbTasks.map((t) => formatTaskSummary(t)).join("\n");
      return `<untrusted_task_data>\n${dbList}\n</untrusted_task_data>`;
    },
    {
      name: "search_task",
      description:
        "Search tasks semantically or by keywords in title within the user's private task library.",
      schema: searchTaskSchema,
    }
  );

  /** ----------------------------
   * GET CURRENT DATE TOOL (Deprecated fallback)
   * ---------------------------- */
  const getCurrentDateTool = tool(
    () => DateTime.now().setZone("UTC").toISO(),
    {
      name: "get_current_date",
      description:
        "Returns the current date and time in ISO 8601 format. Note: Current date and weekday are also injected into system context.",
    }
  );

  return [
    createTaskTool,
    updateTaskTool,
    deleteTaskTool,
    fetchTasksTool,
    searchTaskTool,
    getCurrentDateTool,
  ];
}

/** Backward compatibility export for legacy callers */
export const taskTools = createTaskTools("default-system-user");
