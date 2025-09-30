import { NextRequest } from "next/server";
import { taskAgentWithChathistory } from "@/lib/langchain/memory/task";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { input } = await req.json();

    // Run your agent (no streaming)
    const response = await taskAgentWithChathistory.invoke(
      { input, userId },
      { configurable: { sessionId: `chat-${userId}` } }
    );

    return new Response(
      JSON.stringify({ result: response.output }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error in POST /task-ai:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
