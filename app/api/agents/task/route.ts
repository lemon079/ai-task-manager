import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { checkRateLimit, checkDailyBudget, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { applyInputGuardrails, sanitizeOutput } from "@/lib/langchain/guardrails";
import { getTaskAgentForUser } from "@/lib/langchain/memory/task";
import { getRecentlyTouchedTasksContext, PrismaChatMessageHistory } from "@/lib/langchain/memory/prisma-chat-message";
import { classifyError } from "@/lib/langchain/resilience/error-classifier";
import { circuitBreaker } from "@/lib/langchain/resilience/circuit-breaker";
import { hasGeminiApiKey } from "@/lib/api-keys";
import { DateTime } from "luxon";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const RequestSchema = z
  .object({
    content: z.string().trim().min(1).max(1000).optional(),
    input: z.string().trim().min(1).max(1000).optional(),
  })
  .refine((d) => Boolean(d.content || d.input), {
    message: "Message cannot be empty",
  });

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate API Key Availability
    if (!hasGeminiApiKey()) {
      return NextResponse.json(
        { error: "AI Assistant is not configured: GOOGLE_API_KEY is missing from environment variables." },
        { status: 503 }
      );
    }

    // 3. Origin / CSRF Verification
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "");
      if (originHost !== host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
      }
    }

    // 4. Rate Limit & Daily Budget Checks
    const rateLimitResult = checkRateLimit(`agent:${userId}`, RATE_LIMITS.AGENT);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending another message.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const budgetCheck = checkDailyBudget(userId);
    if (!budgetCheck.allowed) {
      return NextResponse.json(
        { error: "Daily message quota reached for today. Please try again tomorrow." },
        { status: 429 }
      );
    }

    // 5. Validate Request Body with Zod (accepts either { content } or { input })
    const body = await req.json().catch(() => ({}));
    const parseResult = RequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid request payload" },
        { status: 400 }
      );
    }

    const rawContent = (parseResult.data.content || parseResult.data.input)!;

    // 6. Apply Input Guardrails (Pre-filter)
    const inputCheck = applyInputGuardrails(rawContent);
    if (!inputCheck.passed) {
      return NextResponse.json({ error: inputCheck.message }, { status: 400 });
    }

    // 7. Resolve User's Timezone & Dynamic Date Context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timeZone: true },
    });

    const userTimezone = user?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const nowInTz = DateTime.now().setZone(userTimezone);
    const currentDate = nowInTz.toFormat("yyyy-MM-dd");
    const currentWeekday = nowInTz.toFormat("cccc");

    // 8. Fetch Recently Touched Tasks for Contextual Memory
    const recentTasks = await getRecentlyTouchedTasksContext(userId);

    // 9. Prepare Isolated User Agent & History
    const userAgent = await getTaskAgentForUser(userId);
    const sessionId = `chat-${userId}`;
    const history = new PrismaChatMessageHistory(sessionId, userId);
    const chatHistory = await history.getMessages();

    // Check if client expects streaming (SSE)
    const acceptHeader = req.headers.get("accept") || "";
    const isStreamingRequested = acceptHeader.includes("text/event-stream") || req.nextUrl.searchParams.get("stream") === "true";

    if (!isStreamingRequested) {
      // Fallback Non-streaming Execution
      const response = await userAgent.invoke(
        {
          input: inputCheck.sanitizedInput,
          chat_history: chatHistory,
          current_date: currentDate,
          current_weekday: currentWeekday,
          user_timezone: userTimezone,
          recent_tasks: recentTasks,
        },
        {
          signal: req.signal,
        }
      );

      if (!response?.output) {
        return NextResponse.json({ error: "No response generated. Please try again." }, { status: 500 });
      }

      const sanitizedOutput = sanitizeOutput(response.output);

      // Save messages to history
      await history.addUserMessage(inputCheck.sanitizedInput!);
      await history.addAIChatMessage(sanitizedOutput);

      return NextResponse.json(
        { result: sanitizedOutput },
        {
          status: 200,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // 10. True Real-Time Streaming via Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullOutput = "";

        const sendEvent = (eventData: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
        };

        try {
          const eventStream = userAgent.streamEvents(
            {
              input: inputCheck.sanitizedInput,
              chat_history: chatHistory,
              current_date: currentDate,
              current_weekday: currentWeekday,
              user_timezone: userTimezone,
              recent_tasks: recentTasks,
            },
            {
              version: "v2",
              signal: req.signal,
            }
          );

          for await (const event of eventStream) {
            // Check client abort
            if (req.signal.aborted) {
              break;
            }

            const eventType = event.event;

            // Stream LLM token chunks
            if (eventType === "on_chat_model_stream") {
              const chunk = event.data?.chunk;
              const text = chunk?.text || chunk?.content || "";
              if (text && typeof text === "string") {
                fullOutput += text;
                sendEvent({ type: "chunk", text });
              }
            }

            // Stream Tool execution events
            if (eventType === "on_tool_start") {
              sendEvent({
                type: "tool_start",
                tool: event.name,
                input: event.data?.input,
              });
            }

            if (eventType === "on_tool_end") {
              const toolName = event.name;
              const output = event.data?.output;
              const isMutating = ["create_task", "update_task", "delete_task", "create-task", "update-task", "delete-task"].includes(toolName);

              sendEvent({
                type: "tool_end",
                tool: toolName,
                output,
                isMutating,
              });
            }
          }

          // Save final message to history
          if (fullOutput.trim()) {
            await history.addUserMessage(inputCheck.sanitizedInput!);
            await history.addAIChatMessage(sanitizeOutput(fullOutput));
          }

          // Record success for circuit breaker
          circuitBreaker.recordSuccess("gemini-primary");

          sendEvent({ type: "done", fullText: sanitizeOutput(fullOutput) });
          controller.close();
        } catch (streamErr: any) {
          if (req.signal.aborted) {
            sendEvent({ type: "aborted" });
          } else {
            console.error("Streaming error in task agent:", streamErr?.message);
            const classified = classifyError(streamErr);
            circuitBreaker.recordFailure("gemini-primary", classified.category === "QUOTA_EXHAUSTED");

            let userSafeMessage = "An error occurred while generating the response. Please try again.";
            if (classified.category === "QUOTA_EXHAUSTED") {
              userSafeMessage = "The AI assistant is temporarily operating at capacity (daily token quota reached). Your tasks are safe and accessible in the task table below. You can continue managing your tasks manually or try again once tokens refresh.";
            } else if (classified.category === "TRANSIENT") {
              userSafeMessage = "Temporary connectivity issue with the AI service. Please retry in a moment.";
            } else if (classified.category === "FATAL") {
              userSafeMessage = `AI Service Configuration Error: ${classified.message}`;
            }

            sendEvent({
              type: "error",
              error: userSafeMessage,
              category: classified.category,
            });
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error: unknown) {
    const classified = classifyError(error);
    circuitBreaker.recordFailure("gemini-primary", classified.category === "QUOTA_EXHAUSTED");

    let message = "Internal Server Error";
    if (classified.category === "QUOTA_EXHAUSTED") {
      message = "Daily token quota reached for AI model. You can still manage your tasks directly in the dashboard.";
    } else if (classified.category === "TRANSIENT") {
      message = "Temporary AI provider outage. Please retry in a moment.";
    }

    return NextResponse.json(
      { error: message, category: classified.category },
      { status: classified.statusCode || 500 }
    );
  }
}
