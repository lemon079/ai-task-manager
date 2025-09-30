"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { Message } from "@prisma/client";

export async function getMessages(): Promise<Message[]> {
  const session = await auth();
  const userId = session?.user.id;
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: `chat-${userId}` },
      orderBy: { createdAt: "asc" },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}
