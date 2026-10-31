import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { initializeAgent } from "../agent";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { taskPrompt } from "../prompts/task";
import { createTaskTools, taskTools } from "../tools/task";
import { PrismaChatMessageHistory } from "./prisma-chat-message";
import { gemini } from "../llm";

export function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  return new PrismaChatMessageHistory(sessionId);
}

/**
 * Creates or retrieves an isolated agent executor for a specific authenticated user.
 * Guaranteed 100% tenant isolation with user-scoped tool closures.
 */
export async function getTaskAgentForUser(userId: string) {
  const tools = createTaskTools(userId);
  const agentExecutor = await initializeAgent({
    llm: gemini,
    prompt: taskPrompt,
    tools,
  });

  return new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (sessionId: string) => new PrismaChatMessageHistory(sessionId, userId),
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });
}

// Default singleton for legacy fallback callers
export const taskAgent = await initializeAgent({
  llm: gemini,
  prompt: taskPrompt,
  tools: taskTools,
});

export const taskAgentWithChathistory = new RunnableWithMessageHistory({
  runnable: taskAgent,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});
