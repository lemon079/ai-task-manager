import type { Task } from "@prisma/client";
import { embeddings, task_embeddings_index } from ".";

export const EMBEDDING_MODEL_NAME = "mxbai-embed-large:335m";

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

/** Index or re-index a task with strict tenant isolation and model metadata */
export async function createTaskEmbedding(task: Task, userId?: string) {
  const effectiveUserId = userId || task.userId;
  const descriptionPart = task.description ? ` ${task.description}.` : "";
  const text = `${task.title}.${descriptionPart} Priority: ${task.priority}. Status: ${task.status}. Due: ${task.dueDate}`;
  const vector = await withRetry(() => embeddings.embedQuery(text));

  const targetIndex = effectiveUserId
    ? task_embeddings_index.namespace(effectiveUserId)
    : task_embeddings_index;

  await withRetry(() =>
    targetIndex.upsert([
      {
        id: task.id,
        values: vector,
        metadata: {
          title: task.title,
          userId: effectiveUserId,
          status: task.status,
          priority: task.priority,
          embeddingModel: EMBEDDING_MODEL_NAME,
          dimension: vector.length,
        },
      },
    ])
  );
}

/** Delete embedding from user namespace */
export async function deleteTaskEmbedding(taskId: string, userId?: string) {
  const targetIndex = userId
    ? task_embeddings_index.namespace(userId)
    : task_embeddings_index;
  await withRetry(() => targetIndex.deleteOne(taskId));
}

/** Delete all embeddings for a specific user (Privacy / account deletion) */
export async function deleteAllUserEmbeddings(userId: string) {
  if (!userId) return;
  await withRetry(async () => {
    try {
      await task_embeddings_index.namespace(userId).deleteAll();
    } catch (err: any) {
      // If namespace is already empty, Pinecone may 404, which is safe to ignore
      if (!err?.message?.includes("not found")) {
        throw err;
      }
    }
  });
}

/** Update embedding (just re-index) */
export async function updateTaskEmbedding(task: Task, userId?: string) {
  await createTaskEmbedding(task, userId);
}

/** Semantic search with strict tenant namespace and metadata filter */
export async function searchTaskEmbeddings(
  query: string,
  topK = 5,
  userId?: string
) {
  const vector = await embeddings.embedQuery(query);
  const targetIndex = userId
    ? task_embeddings_index.namespace(userId)
    : task_embeddings_index;

  const results = await targetIndex.query({
    vector,
    topK,
    includeMetadata: true,
    ...(userId ? { filter: { userId: { $eq: userId } } } : {}),
  });

  return (results.matches || []).map((match) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata as {
      title?: string;
      userId?: string;
      status?: string;
      priority?: string;
      embeddingModel?: string;
      dimension?: number;
    } | undefined,
  }));
}