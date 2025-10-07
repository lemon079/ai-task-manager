import { Priority, Status } from "@prisma/client";
import z from "zod";

// ========================
// Task Schemas
// ========================

const createTaskSchema = z.object({
  userId: z.string(),
  title: z.string(),
  priority: z.nativeEnum(Priority),
  dueDate: z.coerce.date().optional(), // allow ISO string or Date
});

const updateTaskSchema = z.object({
  id: z.string(),                  // update directly by ID
  title: z.string().optional(),               // can also update directly by title
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  dueDate: z.string().date().optional(),  // accepts ISO string dates
  userId: z.string()
});

const deleteTaskSchema = z.object({
  id: z.string(),
});

const fetchTasksSchema = z.object({
  userId: z.string(),
  createdDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  title: z.string().optional(),
});

const searchTaskSchema = z.object({
  query: z.string().describe("Keyword to match in task titles"),
  userId: z.string(),
});

export {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  fetchTasksSchema,
  searchTaskSchema,
};
