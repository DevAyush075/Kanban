'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createWorkspaceSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from '@/lib/validations/workspace';

export interface WorkspaceDto {
  id: string;
  name: string;
  createdAt: string;
  role: 'OWNER' | 'MEMBER';
}

export interface WorkspaceMemberDto {
  id: string;
  role: 'OWNER' | 'MEMBER';
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface GetUserWorkspacesResult {
  success: boolean;
  message?: string;
  workspaces?: WorkspaceDto[];
}

export interface CreateWorkspaceResult {
  success: boolean;
  message?: string;
  workspace?: WorkspaceDto;
}

export interface GetWorkspaceMembersResult {
  success: boolean;
  message?: string;
  members?: WorkspaceMemberDto[];
}

export interface WorkspaceActionResult {
  success: boolean;
  message?: string;
}

/**
 * Reusable Authorization Helper: Verifies user is a member of the workspace.
 */
export async function requireWorkspaceMember(workspaceId: string, userId: string) {
  if (!workspaceId || !userId) return null;
  return await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
}

/**
 * Reusable Authorization Helper: Verifies user is an OWNER of the workspace.
 */
export async function requireWorkspaceOwner(workspaceId: string, userId: string) {
  if (!workspaceId || !userId) return null;
  const member = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });

  if (member && member.role === 'OWNER') {
    return member;
  }
  return null;
}

/**
 * Server Action: Retrieves workspaces where the authenticated user is a member.
 * Returns id, name, createdAt, and role (OWNER or MEMBER).
 * Automatically provisions a default workspace if the user has none.
 */
export async function getUserWorkspaces(): Promise<GetUserWorkspacesResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to access your workspaces.',
      };
    }

    const userId = session.user.id;

    // Query WorkspaceMember records with workspace data
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: {
        workspace: {
          createdAt: 'desc',
        },
      },
    });

    if (memberships.length > 0) {
      return {
        success: true,
        workspaces: memberships.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          createdAt: m.workspace.createdAt.toISOString(),
          role: m.role,
        })),
      };
    }

    // Provision default workspace if user has no memberships yet
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const workspaceName = `${user?.name || user?.email?.split('@')[0] || 'Personal'}'s Workspace`;

    const newWorkspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name: workspaceName },
      });
      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: ws.id,
          role: 'OWNER',
        },
      });
      return ws;
    });

    return {
      success: true,
      workspaces: [
        {
          id: newWorkspace.id,
          name: newWorkspace.name,
          createdAt: newWorkspace.createdAt.toISOString(),
          role: 'OWNER',
        },
      ],
    };
  } catch (error) {
    console.error('Error in getUserWorkspaces:', error);
    return {
      success: false,
      message: 'Failed to fetch workspaces.',
    };
  }
}

/**
 * Server Action: Creates a new Workspace and adds current user as OWNER inside an atomic transaction.
 * Enforces Zod validation (name: 2-100 characters).
 */
export async function createWorkspace(input: unknown): Promise<CreateWorkspaceResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to create a workspace.',
      };
    }

    const userId = session.user.id;

    // Format data if FormData passed
    let dataToValidate = input;
    if (input instanceof FormData) {
      dataToValidate = { name: input.get('name') };
    } else if (typeof input === 'string') {
      dataToValidate = { name: input };
    }

    // Validate with Zod
    const validationResult = createWorkspaceSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid workspace name.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { name } = validationResult.data;

    // Atomic transaction: Create Workspace & WorkspaceMember (role: OWNER)
    const newWorkspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name },
      });

      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: ws.id,
          role: 'OWNER',
        },
      });

      return ws;
    });

    return {
      success: true,
      message: 'Workspace created successfully.',
      workspace: {
        id: newWorkspace.id,
        name: newWorkspace.name,
        createdAt: newWorkspace.createdAt.toISOString(),
        role: 'OWNER',
      },
    };
  } catch (error) {
    console.error('Error in createWorkspace action:', error);
    return {
      success: false,
      message: 'Failed to create workspace.',
    };
  }
}

/**
 * Server Action: Retrieves all members of a workspace.
 * Verifies that current user is a member of the workspace first.
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<GetWorkspaceMembersResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in.',
      };
    }

    const userId = session.user.id;

    if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim() === '') {
      return {
        success: false,
        message: 'Invalid workspace ID.',
      };
    }

    const cleanWorkspaceId = workspaceId.trim();

    // Verify current user membership
    const membership = await requireWorkspaceMember(cleanWorkspaceId, userId);

    if (!membership) {
      return {
        success: false,
        message: 'You do not have access to this workspace.',
      };
    }

    // Fetch members with user profile details (id, name, email)
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: cleanWorkspaceId },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        role: 'asc', // OWNER first, then MEMBER
      },
    });

    return {
      success: true,
      members,
    };
  } catch (error) {
    console.error('Error in getWorkspaceMembers:', error);
    return {
      success: false,
      message: 'Failed to fetch workspace members.',
    };
  }
}

/**
 * Server Action: Adds a user to a workspace by email address.
 * Strictly enforces OWNER role authorization.
 */
export async function addWorkspaceMember(input: unknown): Promise<WorkspaceActionResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in.',
      };
    }

    const userId = session.user.id;

    const validationResult = addMemberSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid member data.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { workspaceId, email } = validationResult.data;

    // Enforce OWNER role authorization
    const ownerCheck = await requireWorkspaceOwner(workspaceId, userId);

    if (!ownerCheck) {
      return {
        success: false,
        message: 'Only workspace owners can invite or add members.',
      };
    }

    // Find target user by email
    let targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { id: true, email: true },
      });
    }

    if (!targetUser) {
      return {
        success: false,
        message: `No user account found matching "${email}". Please ensure they have registered an account first.`,
      };
    }

    // Add user as MEMBER
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: targetUser.id,
          workspaceId,
        },
      },
      update: {},
      create: {
        userId: targetUser.id,
        workspaceId,
        role: 'MEMBER',
      },
    });

    return {
      success: true,
      message: `User ${targetUser.email} added to the workspace as a MEMBER.`,
    };
  } catch (error) {
    console.error('Error in addWorkspaceMember:', error);
    return {
      success: false,
      message: 'Failed to add workspace member.',
    };
  }
}

/**
 * Server Action: Updates a member's role (OWNER or MEMBER).
 * Strictly enforces OWNER role authorization.
 */
export async function updateWorkspaceMemberRole(input: unknown): Promise<WorkspaceActionResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in.',
      };
    }

    const userId = session.user.id;

    const validationResult = updateMemberRoleSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid role update data.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { workspaceId, memberId, role } = validationResult.data;

    // Enforce OWNER role authorization
    const ownerCheck = await requireWorkspaceOwner(workspaceId, userId);

    if (!ownerCheck) {
      return {
        success: false,
        message: 'Only workspace owners can update member roles.',
      };
    }

    // Check member exists in workspace
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true, workspaceId: true },
    });

    if (!existingMember || existingMember.workspaceId !== workspaceId) {
      return {
        success: false,
        message: 'Member not found in this workspace.',
      };
    }

    // Update member role
    await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });

    return {
      success: true,
      message: `Member role updated to ${role}.`,
    };
  } catch (error) {
    console.error('Error in updateWorkspaceMemberRole:', error);
    return {
      success: false,
      message: 'Failed to update member role.',
    };
  }
}

/**
 * Server Action: Removes a member from a workspace.
 * Strictly enforces OWNER role authorization.
 */
export async function removeWorkspaceMember(input: unknown): Promise<WorkspaceActionResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in.',
      };
    }

    const userId = session.user.id;

    const validationResult = removeMemberSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid removal data.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { workspaceId, memberId } = validationResult.data;

    // Enforce OWNER role authorization
    const ownerCheck = await requireWorkspaceOwner(workspaceId, userId);

    if (!ownerCheck) {
      return {
        success: false,
        message: 'Only workspace owners can remove members.',
      };
    }

    // Find existing member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      select: { id: true, userId: true, workspaceId: true },
    });

    if (!existingMember || existingMember.workspaceId !== workspaceId) {
      return {
        success: false,
        message: 'Member not found in this workspace.',
      };
    }

    // Prevent deleting oneself if sole owner
    if (existingMember.userId === userId) {
      const ownerCount = await prisma.workspaceMember.count({
        where: { workspaceId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        return {
          success: false,
          message: 'You cannot remove yourself because you are the sole owner of this workspace.',
        };
      }
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return {
      success: true,
      message: 'Member removed from workspace.',
    };
  } catch (error) {
    console.error('Error in removeWorkspaceMember:', error);
    return {
      success: false,
      message: 'Failed to remove member from workspace.',
    };
  }
}
