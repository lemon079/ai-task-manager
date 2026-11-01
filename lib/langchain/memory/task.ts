import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { initializeAgent } from "../agent";
import { taskPrompt } from "../prompts/task";
import { createTaskTools } from "../tools/task";
import { PrismaChatMessageHistory } from "./prisma-chat-message";
import { geminiPrimary, geminiFallback } from "../llm";
import { circuitBreaker } from "../resilience/circuit-breaker";

export function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  return new PrismaChatMessageHistory(sessionId);
}

/**
 * Creates an isolated, resilient agent executor for a specific authenticated user.
 * - 100% tenant isolation with user-scoped tool closures.
 * - Model & Provider Fallback Chain: Falls over to secondary model upon 429 quota exhaustion.
 * - Circuit Breaker Aware: Automatically fast-routes to fallback when primary is OPEN.
 */
export async function getTaskAgentForUser(userId: string) {
  const tools = createTaskTools(userId);

  const isPrimaryAvailable = circuitBreaker.isAvailable("gemini-primary");
  const primaryModel = isPrimaryAvailable ? geminiPrimary : geminiFallback;

  // Initialize primary agent executor with self-correcting error handler
  const primaryExecutor = await initializeAgent({
    llm: primaryModel,
    prompt: taskPrompt,
    tools,
  });

  // Initialize secondary fallback agent executor
  const fallbackExecutor = await initializeAgent({
    llm: geminiFallback,
    prompt: taskPrompt,
    tools,
  });

  // Compose resilient runnable with automatic fallback failover
  const resilientExecutor = isPrimaryAvailable
    ? primaryExecutor.withFallbacks({ fallbacks: [fallbackExecutor] })
    : primaryExecutor;

  return resilientExecutor;
}
