import { auth } from "@/auth";
import { prisma } from "@/prisma/prisma";
import { TaskChatProvider } from "@/components/chat/TaskChatProvider";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;

  const messages = userId
    ? await prisma.message.findMany({
        where: { chatId: `chat-${userId}` },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-[calc(100dvh-4.5rem)] w-full">
      <TaskChatProvider initialMessages={formattedMessages} />
    </div>
  );
}
