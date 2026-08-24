import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Board name must be at least 2 characters long' })
    .max(100, { message: 'Board name must not exceed 100 characters' }),
  workspaceId: z
    .string()
    .trim()
    .min(1, { message: 'Workspace ID is required' }),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
