import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import {
  StoredMessage,
  mapStoredMessagesToChatMessages,
  BaseMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { prisma } from "@/prisma/prisma";

export class PrismaChatMessageHistory extends BaseChatMessageHistory {
  private chatId: string;
  lc_namespace: string[] = ["langchain", "stores", "message", "prisma"];

  constructor(chatId: string) {
    super();
    this.chatId = chatId;
  }

  // Load messages from DB
  async getMessages() {

    const rows = await prisma.message.findMany({
      where: { chatId: this.chatId },
      orderBy: { createdAt: "asc" },
      take: 0,
    });

    const stored: StoredMessage[] = rows.map((m) => ({
      type: m.role === "user" ? "human" : "ai",
      data: {
        content: m.content,
        role: m.role,
        name: undefined,
        tool_call_id: undefined,
      },
    }));

    const messages = mapStoredMessagesToChatMessages(stored);
    return messages;
  }

  // Save any BaseMessage
  async addMessage(message: BaseMessage) {

    // Convert to string and remove entire <think>...</think> block
    const content = (message.content as string)

    const role = message._getType() === "human" ? "user" : "assistant";

    await prisma.message.create({
      data: {
        chatId: this.chatId,
        role,
        content,
      },
    });

  }

  // Save a user message directly
  async addUserMessage(content: string) {
    await this.addMessage(new HumanMessage(content));
  }

  // Save an AI message directly
  async addAIChatMessage(content: string) {
    await this.addMessage(new AIMessage(content));
  }

  // Clear all messages for this chat
  async clear() {
    await prisma.message.deleteMany({ where: { chatId: this.chatId } });
  }
}
