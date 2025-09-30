import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
    });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
