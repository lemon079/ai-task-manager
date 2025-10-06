import { Task, User } from "@prisma/client";

// simple color mapping for priorities
export const priorityColors: Record<string, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
}


export type TaskWithUser = Task & {
  user: User;
};