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
    maxIterations: 6,
    returnIntermediateSteps: false,
    // Enable error self-correction so schema/parsing errors are returned to the agent to retry
    handleParsingErrors: (error: any) => {
      const msg = error?.message || String(error);
      return `Tool execution / schema error: ${msg}. Please review the tool parameters, verify format constraints (such as YYYY-MM-DD for dates), and try again.`;
    },
  });

  return agentExecutor;
}
