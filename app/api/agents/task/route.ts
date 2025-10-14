import { NextRequest, NextResponse } from "next/server";
import { taskAgentWithChathistory } from "@/lib/langchain/memory/task";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    const response = await taskAgentWithChathistory.invoke(
      { input: content, userId },
      { configurable: { sessionId: `chat-${userId}` } }
    );

    if (!response?.output) {
      return NextResponse.json({ error: "Try Again" }, { status: 400 });
    }

    return NextResponse.json({ result: response.output }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error in POST /task-ai:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
