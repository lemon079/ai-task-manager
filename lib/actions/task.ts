"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import {
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
} from "@/lib/langchain/tools-schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// -------------------- FETCH TASKS --------------------
export async function getTasks() {
  const session = await auth();
  const userId = session?.user.id;
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

// -------------------- CREATE TASK --------------------
export async function createTask(args: z.infer<typeof createTaskSchema>) {
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

  revalidatePath("/dashboard");
  return task;
}

// -------------------- UPDATE TASK --------------------
export async function updateTask(args: z.infer<typeof updateTaskSchema>) {
  const { newTitle, id, title, priority, status, dueDate, userId } = args;

  if (id) {
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(newTitle && { title: newTitle }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    revalidatePath("/dashboard");
    return updated;
  }

  if (title) {
    const matches = await prisma.task.findMany({
      where: {
        title: { contains: title, mode: "insensitive" },
        ...(userId && { userId }),
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
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    revalidatePath("/dashboard");
    return updated;
  }

  throw new Error("Provide either an ID or title to update a task.");
}

// -------------------- DELETE TASK --------------------
export async function deleteTask(args: { id: string }) {
  const deleted = await prisma.task.delete({ where: { id: args.id } });
  revalidatePath("/dashboard");
  return deleted;
}
