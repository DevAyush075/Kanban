import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export interface AuthContext {
  userId: string;
  session: Session;
}

/**
 * Ensures the request is authenticated.
 * Returns the session and userId if authenticated, or null if unauthenticated.
 */
export async function getAuthSession(): Promise<AuthContext | null> {
  const session = (await auth()) as Session | null;
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return {
    userId: session.user.id,
    session,
  };
}


/**
 * Checks if a user is a member of a given workspace.
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
 * Checks if a user is an OWNER of a given workspace.
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
 * Verifies that a board exists and that the user is a member of its parent workspace.
 */
export async function requireBoardAccess(boardId: string, userId: string) {
  if (!boardId || !userId) return null;

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      workspaceId: true,
    },
  });

  return board;
}

/**
 * Verifies that a task exists and that the user is a member of its parent workspace.
 */
export async function requireTaskAccess(taskId: string, userId: string) {
  if (!taskId || !userId) return null;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      columnId: true,
      order: true,
      column: {
        select: {
          id: true,
          boardId: true,
          board: {
            select: {
              workspaceId: true,
              workspace: {
                select: {
                  members: {
                    where: { userId },
                    select: { id: true, role: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task || !task.column.board.workspace.members.length) {
    return null;
  }

  return task;
}
