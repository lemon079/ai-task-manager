import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    const messages = await prisma.message.findMany({
      where: { chatId: userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
