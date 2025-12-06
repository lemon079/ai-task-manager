import { NextRequest, NextResponse } from "next/server";
import { taskAgentWithChathistory } from "@/lib/langchain/memory/task";
import { auth } from "@/auth";
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { applyInputGuardrails, applyOutputGuardrails } from "@/lib/langchain/guardrails";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(`agent:${userId}`, RATE_LIMITS.AGENT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    const { content } = await req.json();

    // Apply input guardrails
    const inputCheck = applyInputGuardrails(content);
    if (!inputCheck.passed) {
      return NextResponse.json(
        { error: inputCheck.message },
        { status: 400 }
      );
    }

    const response = await taskAgentWithChathistory.invoke(
      { input: inputCheck.sanitizedInput, userId },
      { configurable: { sessionId: `chat-${userId}` } }
    );

    if (!response?.output) {
      return NextResponse.json({ error: "Try Again" }, { status: 400 });
    }

    // Apply output guardrails
    const sanitizedOutput = applyOutputGuardrails(response.output);

    return NextResponse.json(
      { result: sanitizedOutput },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in POST /task-ai:", errorMessage);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

