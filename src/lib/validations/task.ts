import { z } from 'zod';

export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title is required' })
    .max(200, { message: 'Task title must not exceed 200 characters' }),
  description: z
    .string()
    .trim()
    .max(5000, { message: 'Description must not exceed 5000 characters' })
    .optional()
    .or(z.literal('')),
  priority: PriorityEnum.default('MEDIUM'),
  columnId: z
    .string()
    .trim()
    .min(1, { message: 'Column ID is required' }),
  assigneeId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const updateTaskSchema = z.object({
  taskId: z
    .string()
    .trim()
    .min(1, { message: 'Task ID is required' }),
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title is required' })
    .max(200, { message: 'Task title must not exceed 200 characters' })
    .optional(),
  description: z
    .string()
    .trim()
    .max(5000, { message: 'Description must not exceed 5000 characters' })
    .optional()
    .nullable()
    .or(z.literal('')),
  priority: PriorityEnum.optional(),
  assigneeId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const deleteTaskSchema = z.object({
  taskId: z
    .string()
    .trim()
    .min(1, { message: 'Task ID is required' }),
});

export const moveTaskSchema = z.object({
  taskId: z
    .string()
    .trim()
    .min(1, { message: 'Task ID is required' }),
  sourceColumnId: z
    .string()
    .trim()
    .min(1, { message: 'Source column ID is required' }),
  destinationColumnId: z
    .string()
    .trim()
    .min(1, { message: 'Destination column ID is required' }),
  destinationOrder: z
    .number()
    .int({ message: 'Destination order must be an integer' })
    .min(0, { message: 'Destination order cannot be negative' }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

