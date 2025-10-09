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


interface PostMessageInput {
  content: string;
}

export async function postMessage({ content }: PostMessageInput): Promise<Message> {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        chatId: `chat-${userId}`,
        content,
        role: "user",
      },
    });

    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Failed to post message");
  }
}