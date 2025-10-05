"use server";

import { prisma } from "@/prisma/prisma";
import { Task } from "@prisma/client";
import { taskAgentWithChathistory } from "../langchain/memory/task";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// READ - Get all tasks
export async function getTasks(): Promise<Task[]> {
  const session = await auth();
  const userId = session?.user.id;

  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      where: { userId: userId },
    });
    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks, [ERROR]: ${error}`);
  }
}

export async function useAgent(formData: FormData) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return;

  const input = formData.get("input") as string;
  if (!input?.trim()) return;

  const res = await taskAgentWithChathistory.invoke(
    { input: input, userId: userId },
    { configurable: { sessionId: `chat-${userId}` } }
  );

  console.log(res);

  revalidatePath("/tasks");
}
