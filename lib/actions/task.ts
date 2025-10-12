"use server";
import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import type { Task } from "@prisma/client";
import {
  createTaskSchema,
  deleteTaskSchema,
  fetchTasksSchema,
  searchTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";
import { RunnableSequence } from "@langchain/core/runnables";
import { summarizeTaskPrompt } from "../langchain/prompts/task";
import { gpt } from "../langchain/llm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// this fetches task but its solely for client side and must not be used as a tool for LLM. for that, we have fetchTasks
export async function getTasks() {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) throw new Error("Unauthorized");

  try {
    // 1️⃣ Fetch all tasks for the user
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();

    // 2️⃣ Filter overdue tasks that aren’t completed or already overdue
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed" &&
        task.status !== "over_due"
    );

    // 3️⃣ Update those in DB
    if (overdueTasks.length > 0) {
      await prisma.task.updateMany({
        where: {
          id: { in: overdueTasks.map((t) => t.id) },
        },
        data: { status: "over_due" },
      });
    }

    // 4️⃣ Return the latest task list (ensuring updated statuses)
    const updatedTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return updatedTasks;
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}
// delete task tool without revalidatepath for llm
export async function deleteTaskCoreTool({
  id,
}: z.infer<typeof deleteTaskSchema>) {
  return prisma.task.delete({ where: { id } });
}

// Create Task - returns the created Task object
export async function createTask(
  args: z.infer<typeof createTaskSchema>
): Promise<Task> {
  const { title, userId, priority, dueDate } = args;
  const parsedDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.task.create({
    data: {
      title,
      userId,
      priority: (priority as any) || "medium",
      dueDate: parsedDate,
      status: "pending",
    },
  });

  return task;
}

// Fetch Tasks - returns array of Task objects
export async function fetchTasks(
  args: z.infer<typeof fetchTasksSchema>
): Promise<Task[]> {
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

  return tasks;
}

// Update Task - returns the updated Task object
export async function updateTask(
  args: z.infer<typeof updateTaskSchema>
): Promise<Task> {
  const { newTitle, id, title, priority, status, dueDate, userId } = args;
  let task: Task | null = null;

  if (id) {
    task = await prisma.task.update({
      where: { id },
      data: {
        ...(newTitle && { title: newTitle }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });
    return task;
  }

  if (title) {
    const matches = await prisma.task.findMany({
      where: {
        title: { contains: title, mode: "insensitive" },
        ...(userId && { userId }),
      },
    });

    if (matches.length === 0) {
      throw new Error(`No task found with title containing "${title}".`);
    }
    if (matches.length > 1) {
      // Caller (tool/agent) should handle disambiguation
      throw new Error(
        `Multiple tasks found. Provide an id. Found: ${matches
          .map((t) => `${t.id} | ${t.title}`)
          .join(", ")}`
      );
    }

    task = await prisma.task.update({
      where: { id: matches[0].id },
      data: {
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });
    return task;
  }

  throw new Error("Provide a title to update a task.");
}

// Delete Task - returns the deleted Task object
export async function deleteTask(id: z.infer<typeof deleteTaskSchema>) {
  const deleted = await deleteTaskCoreTool(id);
  revalidatePath("/dashboard");
  return deleted;
}

// Search Task - returns minimal task info for display
export async function searchTask(
  args: z.infer<typeof searchTaskSchema>
): Promise<{ id: string; title: string }[]> {
  const { query, userId } = args;
  const tasks = await prisma.task.findMany({
    where: {
      title: { contains: query, mode: "insensitive" },
      userId,
    },
    select: { id: true, title: true },
  });

  return tasks;
}

// Summarize task using llm
export async function summarizeTasks(tasks: Task[]) {
  try {
    const taskString = JSON.stringify(tasks, null, 2);

    const pipeline = RunnableSequence.from([summarizeTaskPrompt, gpt]);

    const result = await pipeline.invoke({ tasks: taskString });

    return result.content ?? "⚠️ Could not generate AI summary at this time.";
  } catch (err) {
    console.error("Failed to summarize tasks:", err);
    return "⚠️ Could not generate AI summary at this time.";
  }
}
