"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useTaskAgentRuntime, type InitialChatMessage } from "@/lib/chat/runtime";
import { TaskThread } from "./TaskThread";

export function TaskChatProvider({
  initialMessages = [],
}: {
  initialMessages?: InitialChatMessage[];
}) {
  const runtime = useTaskAgentRuntime(initialMessages);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TaskThread />
    </AssistantRuntimeProvider>
  );
}
