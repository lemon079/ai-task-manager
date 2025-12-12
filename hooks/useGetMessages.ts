import { Message } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useGetMessages() {
  return useQuery<Message[], Error>({
    queryKey: ["messages"],
    queryFn: async () => {
      try {
        const { data } = await axios.get<ApiResponse<Message[]>>("/api/messages");
        return data.data ?? [];
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message || "Failed to fetch messages");
      }
    },
  });
}
