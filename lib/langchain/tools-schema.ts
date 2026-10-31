import { Priority, Status } from "@prisma/client";
import z from "zod";

// ========================
// Task Schemas (Strictly scoped - no userId argument for LLM)
// ========================

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be under 200 characters")
    .describe("The title of the task to create"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .describe("Optional detailed description or notes"),
  priority: z
    .nativeEnum(Priority)
    .default(Priority.medium)
    .describe("Priority level: 'low', 'medium', or 'high'"),
  dueDate: z
    .string()
    .optional()
    .describe("Due date in YYYY-MM-DD format (or ISO string with optional time like YYYY-MM-DDTHH:mm)"),
});

export const updateTaskSchema = z
  .object({
    id: z
      .string()
      .optional()
      .describe("Exact task ID to update if known from recently referenced context"),
    title: z
      .string()
      .optional()
      .describe("Current title to locate the task"),
    newTitle: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .describe("Updated task title"),
    description: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .describe("Updated task description"),
    priority: z
      .nativeEnum(Priority)
      .optional()
      .describe("Updated priority: 'low', 'medium', or 'high'"),
    status: z
      .nativeEnum(Status)
      .optional()
      .describe("Updated status: 'pending', 'in_progress', or 'completed'"),
    dueDate: z
      .string()
      .optional()
      .describe("Updated due date in YYYY-MM-DD or ISO format"),
  })
  .refine((data) => data.id || data.title, {
    message: "Provide either 'id' or 'title' to identify the task to update.",
  });

export const deleteTaskSchema = z
  .object({
    id: z
      .string()
      .optional()
      .describe("Exact task ID to delete if known from recently referenced context"),
    query: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("Title or descriptive keyword of the task to delete"),
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true only when the user explicitly requests or confirms the deletion"),
  })
  .refine((data) => data.id || data.query, {
    message: "Provide either 'id' or 'query' (title) to identify the task to delete.",
  });

export const fetchTasksSchema = z.object({
  createdDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Filter by creation date (YYYY-MM-DD)"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Filter by due date (YYYY-MM-DD)"),
  status: z
    .nativeEnum(Status)
    .optional()
    .describe("Filter by task status"),
  priority: z
    .nativeEnum(Priority)
    .optional()
    .describe("Filter by task priority"),
  title: z
    .string()
    .max(200)
    .optional()
    .describe("Filter by text contained in the title"),
});

export const searchTaskSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(200, "Search query must be under 200 characters")
    .describe("Natural language phrase or keyword to search tasks semantically"),
});
