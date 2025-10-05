import { Message } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useGetMessages() {
  return useQuery<Message[], Error>({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      return res.json();
    },
    retry: 1,
  });
}
