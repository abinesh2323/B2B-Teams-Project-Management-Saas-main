import { z } from "zod";

export const startTimerSchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  projectId: z.string().trim().min(1, "Project ID is required"),
});

export const stopTimerSchema = z.object({
  description: z.string().trim().max(1000).optional(),
});

export const manualEntrySchema = z.object({
  taskId: z.string().trim().min(1, "Task ID is required"),
  projectId: z.string().trim().min(1, "Project ID is required"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time",
  }),
  description: z.string().trim().max(1000).optional(),
});

export const updateEntrySchema = z.object({
  startTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start time",
    })
    .optional(),
  endTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end time",
    })
    .optional(),
  description: z.string().trim().max(1000).optional(),
});

export const timesheetFilterSchema = z.object({
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)))
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)))
    .optional(),
  projectId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  pageNumber: z.coerce.number().min(1).default(1),
});

export const entryIdSchema = z.string().trim().min(1);
