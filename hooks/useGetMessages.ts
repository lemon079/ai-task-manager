import { Message } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useGetMessages() {
  return useQuery<Message[], Error>({
    queryKey: ["messages"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/messages");
        return data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch messages");
      }
    },
    retry: 1,
  });
}
