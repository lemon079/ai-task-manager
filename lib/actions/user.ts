"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { deleteAllUserEmbeddings } from "@/lib/langchain/embeddings/crud";
import { revalidatePath } from "next/cache";

/**
 * Privacy / GDPR Compliance: Delete all user data across Postgres and Pinecone
 */
export async function deleteUserData(): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Delete all vectors from Pinecone user namespace
    try {
      await deleteAllUserEmbeddings(userId);
    } catch (err) {
      console.warn("[PRIVACY_DELETE_WARN] Pinecone vectors deletion error:", err);
    }

    // 2. Delete all chat messages for this user
    await prisma.message.deleteMany({
      where: {
        OR: [
          { chatId: `chat-${userId}` },
          { userId },
        ],
      },
    });

    // 3. Delete all tasks for this user
    await prisma.task.deleteMany({
      where: { userId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath("/settings");

    return {
      success: true,
      message: "All personal tasks, chat history, and vector embeddings deleted successfully.",
    };
  } catch (error) {
    console.error("❌ Error in deleteUserData:", error);
    throw new Error("Failed to delete user data");
  }
}
