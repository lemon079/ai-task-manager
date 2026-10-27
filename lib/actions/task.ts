"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import {
  createTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { gemini, gpt } from "../langchain/llm";
import { summarizeTaskPrompt } from "../langchain/prompts/task";
import { Task } from "@prisma/client";
import {
  createTaskEmbedding,
  deleteTaskEmbedding,
  updateTaskEmbedding,
} from "../langchain/embeddings/crud";

// -------------------- FETCH TASKS --------------------
async function getTasks() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  try {
    const now = new Date();

    // Fetch all tasks
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Find overdue ones
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed" &&
        task.status !== "over_due"
    );

    // Mark overdue tasks
    if (overdueTasks.length > 0) {
      await prisma.task.updateMany({
        where: { id: { in: overdueTasks.map((t) => t.id) } },
        data: { status: "over_due" },
      });
    }

    // Refetch and return
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}

// -------------------- FETCH TASKS FOR SPECIFIC USER (for cron jobs) --------------------
async function getTasksForUser(userId: string) {
  if (!userId) throw new Error("userId is required");

  try {
    const now = new Date();

    // Fetch all tasks for user
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    // Find overdue ones
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed" &&
        task.status !== "over_due"
    );

    // Mark overdue tasks
    if (overdueTasks.length > 0) {
      await prisma.task.updateMany({
        where: { id: { in: overdueTasks.map((t) => t.id) } },
        data: { status: "over_due" },
      });

      // Refetch with user relation
      return prisma.task.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    }

    return tasks;
  } catch (error) {
    console.error("❌ Error fetching tasks for user:", error);
    throw new Error("Failed to fetch tasks for user");
  }
}

// -------------------- CREATE TASK --------------------
async function createTask(args: z.infer<typeof createTaskSchema>) {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  const effectiveUserId = sessionUserId || args.userId;
  if (!effectiveUserId) throw new Error("Unauthorized");

  const { title, description, priority, dueDate } = args;
  const parsedDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      userId: effectiveUserId,
      priority: (priority as any) || "medium",
      dueDate: parsedDate,
      status: "pending",
    },
  });

  try {
    await createTaskEmbedding(task);
  } catch (err) {
    console.warn("Embedding index skipped or failed:", err);
  }

  revalidatePath("/dashboard");
  return task;
}

// -------------------- UPDATE TASK --------------------
async function updateTask(args: z.infer<typeof updateTaskSchema>) {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  const effectiveUserId = sessionUserId || args.userId;
  if (!effectiveUserId) throw new Error("Unauthorized");

  const { newTitle, id, title, description, priority, status, dueDate } = args;

  if (id) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== effectiveUserId) {
      throw new Error("Task not found or unauthorized");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(newTitle && { title: newTitle }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    try {
      await updateTaskEmbedding(updated);
    } catch (err) {
      console.warn("Embedding update skipped or failed:", err);
    }

    revalidatePath("/dashboard");
    return updated;
  }

  if (title) {
    const matches = await prisma.task.findMany({
      where: {
        title: { contains: title, mode: "insensitive" },
        userId: effectiveUserId,
      },
    });

    if (matches.length === 0)
      throw new Error(`No task found with title containing "${title}".`);

    if (matches.length > 1)
      throw new Error(
        `Multiple tasks found. Provide an id. Found: ${matches
          .map((t) => `${t.id} | ${t.title}`)
          .join(", ")}`
      );

    const updated = await prisma.task.update({
      where: { id: matches[0].id },
      data: {
        ...(newTitle && { title: newTitle }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    try {
      await updateTaskEmbedding(updated);
    } catch (err) {
      console.warn("Embedding update skipped or failed:", err);
    }

    revalidatePath("/dashboard");
    return updated;
  }

  throw new Error("Provide either an ID or title to update a task.");
}

// -------------------- DELETE TASK --------------------
async function deleteTask(args: { id: string }) {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) throw new Error("Unauthorized");

  const existing = await prisma.task.findUnique({ where: { id: args.id } });
  if (!existing || existing.userId !== sessionUserId) {
    throw new Error("Task not found or unauthorized");
  }

  const deleted = await prisma.task.delete({ where: { id: args.id } });

  try {
    await deleteTaskEmbedding(args.id);
  } catch (err) {
    console.warn("Embedding delete skipped or failed:", err);
  }

  revalidatePath("/dashboard");
  return deleted;
}

async function summarizeTasks(tasks: Task[]) {
  if (!tasks?.length) return "No tasks available for summary.";

  try {
    const hasGoogleKey =
      process.env.GOOGLE_API_KEY &&
      !process.env.GOOGLE_API_KEY.includes("PLACEHOLDER");
    const model = hasGoogleKey ? gemini : gpt;

    const pipeline = summarizeTaskPrompt.pipe(model);
    const res = await pipeline.invoke({ tasks });

    return typeof res === "string"
      ? res
      : res?.content ?? res?.text ?? JSON.stringify(res);
  } catch (error) {
    console.warn("AI task summarization error, using fallback summary:", error);
    const overdueCount = tasks.filter((t) => t.status === "over_due").length;
    const pendingCount = tasks.filter(
      (t) => t.status === "pending" || t.status === "in_progress"
    ).length;
    return `You have ${pendingCount} active task(s)${
      overdueCount > 0 ? ` including ${overdueCount} overdue` : ""
    }. Stay productive!`;
  }
}

export {
  getTasks,
  getTasksForUser,
  createTask,
  updateTask,
  deleteTask,
  summarizeTasks,
};
