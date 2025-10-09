import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SendMessageInput {
  content: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }: SendMessageInput) => {
      const { data } = await axios.post("/api/agents/task", { content });
      return data;
    },
    onSuccess: () => {
      // Refetch messages so chat updates automatically
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
