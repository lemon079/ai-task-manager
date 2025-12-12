
import { Task } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useGetTasks() {
  return useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const json: ApiResponse<Task[]> = await res.json();
      return json.data ?? [];
    },
    staleTime: 1 * 60 * 1000, // 1 min - tasks change more frequently
  });
}
