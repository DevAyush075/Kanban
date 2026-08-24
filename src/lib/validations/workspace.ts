import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Workspace name must be at least 2 characters long' })
    .max(100, { message: 'Workspace name cannot exceed 100 characters' }),
});

export const addMemberSchema = z.object({
  workspaceId: z
    .string()
    .trim()
    .min(1, { message: 'Workspace ID is required' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Please enter a valid email address' }),
});

export const updateMemberRoleSchema = z.object({
  workspaceId: z
    .string()
    .trim()
    .min(1, { message: 'Workspace ID is required' }),
  memberId: z
    .string()
    .trim()
    .min(1, { message: 'Member ID is required' }),
  role: z.enum(['OWNER', 'MEMBER']),
});

export const removeMemberSchema = z.object({
  workspaceId: z
    .string()
    .trim()
    .min(1, { message: 'Workspace ID is required' }),
  memberId: z
    .string()
    .trim()
    .min(1, { message: 'Member ID is required' }),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
