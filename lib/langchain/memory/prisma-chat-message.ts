import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import {
  StoredMessage,
  mapStoredMessagesToChatMessages,
  BaseMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { prisma } from "@/prisma/prisma";

const MAX_HISTORY_CHAR_BUDGET = 12000; // ~3000 tokens

export class PrismaChatMessageHistory extends BaseChatMessageHistory {
  private chatId: string;
  private userId?: string;
  lc_namespace: string[] = ["langchain", "stores", "message", "prisma"];

  constructor(chatId: string, userId?: string) {
    super();
    this.chatId = chatId;
    this.userId = userId || (chatId.startsWith("chat-") ? chatId.replace("chat-", "") : undefined);
  }

  /**
   * Load messages from DB trimmed by token/character budget instead of a flat limit
   */
  async getMessages(): Promise<BaseMessage[]> {
    const rows = await prisma.message.findMany({
      where: { chatId: this.chatId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    if (!rows.length) return [];

    // Accumulate messages backwards until budget is reached
    const budgetedRows: typeof rows = [];
    let charCount = 0;

    for (const row of rows) {
      const length = (row.content || "").length;
      if (charCount + length > MAX_HISTORY_CHAR_BUDGET && budgetedRows.length >= 2) {
        break;
      }
      budgetedRows.push(row);
      charCount += length;
    }

    // Reverse back to chronological order
    const chronologicalRows = budgetedRows.reverse();

    const stored: StoredMessage[] = chronologicalRows.map((m) => ({
      type: m.role === "user" ? "human" : "ai",
      data: {
        content: m.content,
        role: m.role,
        name: undefined,
        tool_call_id: undefined,
      },
    }));

    return mapStoredMessagesToChatMessages(stored);
  }

  /**
   * Save a message to DB with concurrency safety
   */
  async addMessage(message: BaseMessage) {
    const content = typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);

    const role = message._getType() === "human" ? "user" : "assistant";

    // Clean any internal thinking blocks from saved history
    const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (!cleanContent) return;

    await prisma.message.create({
      data: {
        chatId: this.chatId,
        userId: this.userId || null,
        role,
        content: cleanContent,
      },
    });
  }

  async addUserMessage(content: string) {
    await this.addMessage(new HumanMessage(content));
  }

  async addAIChatMessage(content: string) {
    await this.addMessage(new AIMessage(content));
  }

  async clear() {
    await prisma.message.deleteMany({ where: { chatId: this.chatId } });
  }
}

/**
 * Fetch recently touched tasks to inject into system prompt as structured references
 */
export async function getRecentlyTouchedTasksContext(userId: string): Promise<string> {
  if (!userId) return "No recently touched tasks.";

  try {
    const recentTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        updatedAt: true,
      },
    });

    if (!recentTasks.length) {
      return "No tasks recorded yet.";
    }

    return recentTasks
      .map(
        (t) =>
          `- [ID: ${t.id}] "${t.title}" | Status: ${t.status} | Priority: ${t.priority} | Due: ${
            t.dueDate ? t.dueDate.toISOString().split("T")[0] : "None"
          }`
      )
      .join("\n");
  } catch (error) {
    console.warn("[RECENT_TASKS_WARN] Could not fetch recent tasks context:", error);
    return "No recently touched tasks.";
  }
}
