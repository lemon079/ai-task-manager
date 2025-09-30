import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { initializeAgent } from "../agent";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { taskPrompt } from "../prompts/task";
import { taskTools } from "../tools/task";
import { PrismaChatMessageHistory } from "./prisma-chat-message";
import { gemini } from "../llm";

export function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  return new PrismaChatMessageHistory(sessionId);
}

export const taskAgent = await initializeAgent({
  llm: gemini,
  prompt: taskPrompt,
  tools: taskTools,
});

// ---- wrap agent with memory ----
export const taskAgentWithChathistory = new RunnableWithMessageHistory({
  runnable: taskAgent,
  getMessageHistory,
  inputMessagesKey: "input", // must match prompt var
  historyMessagesKey: "chat_history", // must match prompt placeholder
});
