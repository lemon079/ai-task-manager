import { Message } from "@prisma/client";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export type ResponseMessage = Pick<Message, "role" | "content">;

export function useTaskAgent(): UseMutationResult<
  ResponseMessage,
  AxiosError<{ message: string }>,
  { input: string }
> {
  return useMutation({
    mutationFn: async (input: { input: string }) => {
      const response = await axios.post<ResponseMessage>(
        "/api/agents/task",
        input
      );
      return response.data;
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message ??
        "Something went wrong, please try again.";
      toast.error(msg);
    },
  });
}
