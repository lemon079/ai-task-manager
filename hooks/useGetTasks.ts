
import { Task } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

export function useGetTasks() {
  return useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return res.json();
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
