import { z } from 'zod';

export const askAssistantInputSchema = z.object({
  boardId: z.string().trim().min(1, { message: 'Board ID is required' }),
  question: z
    .string()
    .trim()
    .min(3, { message: 'Question must be at least 3 characters long' })
    .max(2000, { message: 'Question cannot exceed 2000 characters' }),
});

export const assistantResponseSchema = z.object({
  answer: z.string().min(1, { message: 'Answer is required' }),
  recommendations: z
    .array(
      z.object({
        taskId: z.string().min(1),
        reason: z.string().min(1),
      })
    )
    .default([]),
  risks: z.array(z.string()).default([]),
  nextActions: z.array(z.string()).default([]),
});

export type AskAssistantInput = z.infer<typeof askAssistantInputSchema>;
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
