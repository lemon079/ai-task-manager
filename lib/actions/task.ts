"use server";

import { prisma } from "@/prisma/prisma";
import { Task } from "@prisma/client";
import { auth } from "@/auth";
import { gpt } from "../langchain/llm";
import { RunnableSequence } from "@langchain/core/runnables";
import { summarizeTaskPrompt } from "../langchain/prompts/task";

// READ - Get all tasks
export async function getTasks(): Promise<Task[]> {
  const session = await auth();
  const userId = session?.user.id;

  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      where: { userId: userId },
      include: { user: true },
    });

    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks, [ERROR]: ${error}`);
  }
}

// READ - Summarize task using llm
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
