import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { taskAgentWithChathistory } from "@/lib/langchain/memory/task";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { input } = await req.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream tokens from LangChain
          const responseStream = await taskAgentWithChathistory.stream(
            { input, userId },
            { configurable: { sessionId: `chat-${userId}` } }
          );

          for await (const chunk of responseStream) {
            if (chunk?.output) {
              controller.enqueue(encoder.encode(chunk.output));
            }
          }

          // Optionally revalidate cache after the response finishes
          revalidatePath("/task-ai", "page");
        } catch (err) {
          console.error("❌ Error in streaming:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ Error in POST /task-ai:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
