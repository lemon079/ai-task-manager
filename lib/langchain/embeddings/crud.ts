import type { Task } from "@prisma/client";
import { embeddings, task_embeddings_index } from ".";

/** Retry helper for stable Pinecone/Embedding calls */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    console.warn(`Retrying after error: ${error.message} (${retries} left)`);
    await new Promise((res) => setTimeout(res, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

/** Index or re-index a task */
export async function createTaskEmbedding(task: Task) {
  const text = `${task.title}. Priority: ${task.priority}. Status: ${task.status}. Due: ${task.dueDate}`;
  const vector = await withRetry(() => embeddings.embedQuery(text));

  await withRetry(() =>
    task_embeddings_index.upsert([
      {
        id: task.id,
        values: vector,
        metadata: {
          title: task.title,
          userId: task.userId,
          status: task.status,
          priority: task.priority,
        },
      },
    ])
  );
}

/** Delete embedding */
export async function deleteTaskEmbedding(taskId: string) {
  await withRetry(() => task_embeddings_index.deleteOne(taskId));
}

/** Update embedding (just re-index) */
export async function updateTaskEmbedding(task: Task) {
  await createTaskEmbedding(task);
}

export async function searchTaskEmbeddings(query: string, topK = 3) {
  const vector = await embeddings.embedQuery(query);
  const results = await task_embeddings_index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return results.matches.map((match) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}