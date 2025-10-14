import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StructuredTool, Tool } from "langchain/tools";

export async function initializeAgent({
  llm,
  prompt,
  tools,
}: {
  llm: BaseChatModel;
  prompt: ChatPromptTemplate;
  tools: (Tool | StructuredTool)[];
}) {
  
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  return agentExecutor;
}
