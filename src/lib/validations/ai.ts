import { z } from 'zod';
import { PriorityEnum } from './task';

export const generatePlanInputSchema = z.object({
  boardId: z
    .string()
    .trim()
    .min(1, { message: 'Board ID is required' }),
  prompt: z
    .string()
    .trim()
    .min(5, { message: 'Prompt must be at least 5 characters long' })
    .max(5000, { message: 'Prompt cannot exceed 5000 characters' }),
});

export const proposedSubtaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Subtask title is required' })
    .max(200, { message: 'Subtask title cannot exceed 200 characters' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Subtask description cannot exceed 2000 characters' })
    .optional()
    .nullable()
    .or(z.literal('')),
  priority: PriorityEnum.default('MEDIUM'),
  reasoning: z
    .string()
    .trim()
    .max(1000, { message: 'Reasoning cannot exceed 1000 characters' })
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const proposedTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title is required' })
    .max(200, { message: 'Task title cannot exceed 200 characters' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description cannot exceed 2000 characters' })
    .optional()
    .nullable()
    .or(z.literal('')),
  priority: PriorityEnum.default('MEDIUM'),
  column: z
    .string()
    .trim()
    .min(1, { message: 'Target column name is required' }),
  reasoning: z
    .string()
    .trim()
    .max(1000, { message: 'Reasoning cannot exceed 1000 characters' })
    .optional()
    .nullable()
    .or(z.literal('')),
  subtasks: z
    .array(proposedSubtaskSchema)
    .max(5, { message: 'Maximum 5 subtasks allowed per task' })
    .default([]),
});

export const aiProposalSchema = z
  .object({
    summary: z
      .string()
      .trim()
      .min(1, { message: 'Proposal summary is required' })
      .max(1000, { message: 'Summary cannot exceed 1000 characters' }),
    tasks: z
      .array(proposedTaskSchema)
      .min(1, { message: 'AI proposal must contain at least 1 task' })
      .max(20, { message: 'AI proposal cannot exceed 20 top-level tasks' }),
  })
  .refine(
    (data) => {
      const totalSubtasks = data.tasks.reduce((sum, t) => sum + (t.subtasks ? t.subtasks.length : 0), 0);
      const totalCount = data.tasks.length + totalSubtasks;
      return totalCount <= 100;
    },
    { message: 'AI proposal cannot exceed 100 total items (tasks + subtasks).' }
  );

export const applyPlanInputSchema = z.object({
  boardId: z
    .string()
    .trim()
    .min(1, { message: 'Board ID is required' }),
  proposal: aiProposalSchema,
});

export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>;
export type ProposedSubtask = z.infer<typeof proposedSubtaskSchema>;
export type ProposedTask = z.infer<typeof proposedTaskSchema>;
export type AiProposal = z.infer<typeof aiProposalSchema>;
export type ApplyPlanInput = z.infer<typeof applyPlanInputSchema>;
