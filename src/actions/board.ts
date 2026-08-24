'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createBoardSchema, type CreateBoardInput } from '@/lib/validations/board';

export interface BoardDto {
  id: string;
  name: string;
  category: string;
  taskCount: number;
  completedTasks: number;
  starred: boolean;
  color: string;
  updatedAt: string;
  createdAt: string;
  workspaceId: string;
  members: string[];
}

export interface GetUserBoardsResult {
  success: boolean;
  message?: string;
  boards?: BoardDto[];
}

export interface WorkspaceDto {
  id: string;
  name: string;
}

export interface GetUserWorkspacesResult {
  success: boolean;
  message?: string;
  workspaces?: WorkspaceDto[];
}

export interface CreateBoardResult {
  success: boolean;
  message?: string;
  board?: {
    id: string;
    name: string;
    workspaceId: string;
    createdAt: string;
  };
}

import { type TaskDto } from '@/actions/task';

export interface BoardColumnDto {
  id: string;
  name: string;
  order: number;
  boardId: string;
  tasks?: TaskDto[];
}

export interface GetBoardByIdResult {
  success: boolean;
  message?: string;
  board?: {
    id: string;
    name: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    workspace: {
      id: string;
      name: string;
    };
    columns: BoardColumnDto[];
  };
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const PALETTE_COLORS = [
  'from-[#06b6d4] to-[#2dd4bf]',
  'from-[#fbbf24] to-[#f59e0b]',
  'from-[#a855f7] to-[#ec4899]',
  'from-[#10b981] to-[#059669]',
];

/**
 * Server Action: Retrieves all boards belonging to workspaces
 * where the current authenticated user is a member.
 */
export async function getUserBoards(): Promise<GetUserBoardsResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to access your workspace boards.',
      };
    }

    const userId = session.user.id;

    // Relational query: Get boards where workspace has member with userId
    const rawBoards = await prisma.board.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        workspace: {
          select: {
            name: true,
            members: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              take: 4,
            },
          },
        },
        columns: {
          select: {
            tasks: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format output DTOs for the dashboard UI
    const boards: BoardDto[] = rawBoards.map((b, index) => {
      const taskCount = b.columns.reduce((sum, col) => sum + col.tasks.length, 0);
      const memberInitialList = b.workspace.members.map((m) => {
        const u = m.user;
        if (u.name) return u.name.charAt(0).toUpperCase();
        if (u.email) return u.email.charAt(0).toUpperCase();
        return 'U';
      });

      return {
        id: b.id,
        name: b.name,
        category: b.workspace.name || 'Workspace',
        taskCount,
        completedTasks: 0,
        starred: false,
        color: PALETTE_COLORS[index % PALETTE_COLORS.length],
        updatedAt: formatDate(b.updatedAt),
        createdAt: b.createdAt.toISOString(),
        workspaceId: b.workspaceId,
        members: memberInitialList.length > 0 ? memberInitialList : ['U'],
      };
    });

    return {
      success: true,
      boards,
    };
  } catch (error) {
    console.error('Error fetching user boards:', error);
    return {
      success: false,
      message: 'Failed to fetch boards. Please try again later.',
    };
  }
}

import {
  getUserWorkspaces as getWorkspacesAction,
  createWorkspace as createWorkspaceAction,
} from '@/actions/workspace';

/**
 * Server Action: Retrieves workspaces where the current authenticated user is a member.
 * Delegates to src/actions/workspace.ts.
 */
export async function getUserWorkspaces(): Promise<GetUserWorkspacesResult> {
  return await getWorkspacesAction();
}

/**
 * Server Action: Creates a new Workspace and adds current user as OWNER.
 * Delegates to src/actions/workspace.ts.
 */
export async function createWorkspace(input: unknown): Promise<CreateBoardResult | any> {
  return await createWorkspaceAction(input);
}

/**
 * Server Action: Joins an existing Workspace by Workspace ID.
 */
export async function joinWorkspace(workspaceId: string): Promise<{
  success: boolean;
  message?: string;
  workspace?: { id: string; name: string };
}> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to join a workspace.',
      };
    }

    const userId = session.user.id;
    const cleanWorkspaceId = workspaceId ? workspaceId.trim() : '';

    if (!cleanWorkspaceId) {
      return {
        success: false,
        message: 'Workspace ID is required.',
      };
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: cleanWorkspaceId },
    });

    if (!workspace) {
      return {
        success: false,
        message: 'Workspace not found. Please verify the Workspace ID.',
      };
    }

    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId,
        workspaceId: workspace.id,
        role: 'MEMBER',
      },
    });

    return {
      success: true,
      workspace: { id: workspace.id, name: workspace.name },
    };
  } catch (error) {
    console.error('Error joining workspace:', error);
    return {
      success: false,
      message: 'Failed to join workspace.',
    };
  }
}

/**
 * Server Action: Creates a new board with 4 default columns in a Prisma transaction.
 * Enforces authentication and WorkspaceMember authorization.
 */
export async function createBoard(input: unknown): Promise<CreateBoardResult> {
  try {
    // 1. Authenticate current user
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to create a board.',
      };
    }

    // User ID obtained ONLY from session, never from client
    const userId = session.user.id;

    // 2. Parse input data (supports JSON object or FormData)
    let dataToValidate: unknown = input;
    if (input instanceof FormData) {
      dataToValidate = {
        name: input.get('name') || input.get('title'),
        workspaceId: input.get('workspaceId'),
      };
    }

    // 3. Zod validation
    const validationResult = createBoardSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || 'Invalid board inputs provided.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { name, workspaceId } = validationResult.data;

    // 4. Verify workspace membership via WorkspaceMember model
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return {
        success: false,
        message: 'You do not have access to this workspace.',
      };
    }

    // 5. Prisma Transaction: Create Board & 4 Default Columns atomically
    const newBoard = await prisma.$transaction(async (tx) => {
      // Create Board
      const board = await tx.board.create({
        data: {
          name,
          workspaceId,
        },
      });

      // Create 4 Default Columns
      await tx.column.createMany({
        data: [
          { name: 'Backlog', order: 0, boardId: board.id },
          { name: 'To Do', order: 1, boardId: board.id },
          { name: 'In Progress', order: 2, boardId: board.id },
          { name: 'Done', order: 3, boardId: board.id },
        ],
      });

      return board;
    });

    // 6. Predictable Success Response
    return {
      success: true,
      board: {
        id: newBoard.id,
        name: newBoard.name,
        workspaceId: newBoard.workspaceId,
        createdAt: newBoard.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in createBoard action:', error);
    // Generic response - never expose raw database or Prisma stack traces
    return {
      success: false,
      message: 'An unexpected database error occurred while creating the board.',
    };
  }
}

/**
 * Server Action: Retrieves a board and its columns by board ID.
 * Enforces authentication and WorkspaceMember authorization.
 * Returns only data necessary for the board page without exposing tasks or DB errors.
 */
export async function getBoardById(boardId: string): Promise<GetBoardByIdResult> {
  try {
    // 1. Authenticate user
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to access this board.',
      };
    }

    const userId = session.user.id;

    // 2. Validate boardId input
    if (!boardId || typeof boardId !== 'string' || boardId.trim() === '') {
      return {
        success: false,
        message: 'Invalid board ID provided.',
      };
    }

    const cleanBoardId = boardId.trim();

    // 3. Find board and verify workspace membership authorization in Prisma query
    const rawBoard = await prisma.board.findFirst({
      where: {
        id: cleanBoardId,
        workspace: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        columns: {
          select: {
            id: true,
            name: true,
            order: true,
            boardId: true,
            tasks: {
              select: {
                id: true,
                title: true,
                description: true,
                priority: true,
                order: true,
                columnId: true,
                parentId: true,
                isAiGenerated: true,
                aiReasoning: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!rawBoard) {
      // Check if board exists to distinguish unauthorized vs not found, without exposing data
      const boardExists = await prisma.board.findUnique({
        where: { id: cleanBoardId },
        select: { id: true },
      });

      if (boardExists) {
        return {
          success: false,
          message: 'You do not have permission to access this board.',
        };
      }

      return {
        success: false,
        message: 'Board not found.',
      };
    }

    // 4. Return serialized board & columns data
    return {
      success: true,
      board: {
        id: rawBoard.id,
        name: rawBoard.name,
        workspaceId: rawBoard.workspaceId,
        createdAt: rawBoard.createdAt.toISOString(),
        updatedAt: rawBoard.updatedAt.toISOString(),
        workspace: {
          id: rawBoard.workspace.id,
          name: rawBoard.workspace.name,
        },
        columns: rawBoard.columns.map((col) => ({
          id: col.id,
          name: col.name,
          order: col.order,
          boardId: col.boardId,
          tasks: col.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            order: t.order,
            columnId: t.columnId,
            parentId: t.parentId,
            isAiGenerated: t.isAiGenerated,
            aiReasoning: t.aiReasoning,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          })),
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching board by ID:', error);
    return {
      success: false,
      message: 'Failed to retrieve board details. Please try again later.',
    };
  }
}

/**
 * Server Action: Deletes a board by ID.
 * Enforces authentication and WorkspaceMember authorization.
 */
export async function deleteBoard(boardId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to delete a board.',
      };
    }

    const userId = session.user.id;

    if (!boardId || typeof boardId !== 'string' || boardId.trim() === '') {
      return {
        success: false,
        message: 'Invalid board ID provided.',
      };
    }

    const cleanBoardId = boardId.trim();

    // Verify board exists and current user is a member of the parent workspace
    const board = await prisma.board.findFirst({
      where: {
        id: cleanBoardId,
        workspace: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!board) {
      return {
        success: false,
        message: 'Board not found or access denied.',
      };
    }

    await prisma.board.delete({
      where: { id: cleanBoardId },
    });

    return {
      success: true,
      message: 'Board deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting board:', error);
    return {
      success: false,
      message: 'Failed to delete board due to a database error.',
    };
  }
}

