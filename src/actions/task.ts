'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  createTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  moveTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/lib/validations/task';

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  order: number;
  columnId: string;
  parentId?: string | null;
  subTasks?: TaskDto[];
  isAiGenerated: boolean;
  aiReasoning: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActionResult {
  success: boolean;
  message?: string;
  task?: TaskDto;
}

export interface GetBoardTasksResult {
  success: boolean;
  message?: string;
  tasks?: TaskDto[];
}

function formatTask(task: {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  order: number;
  columnId: string;
  parentId?: string | null;
  subTasks?: any[];
  isAiGenerated: boolean;
  aiReasoning: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    order: task.order,
    columnId: task.columnId,
    parentId: task.parentId || null,
    subTasks: task.subTasks ? task.subTasks.map(formatTask) : [],
    isAiGenerated: task.isAiGenerated,
    aiReasoning: task.aiReasoning,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/**
 * Server Action: Get all tasks for a specific board, ordered by order ASC.
 * Verifies WorkspaceMember authorization.
 */
export async function getBoardTasks(boardId: string): Promise<GetBoardTasksResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to access board tasks.',
      };
    }

    const userId = session.user.id;

    if (!boardId || typeof boardId !== 'string' || boardId.trim() === '') {
      return {
        success: false,
        message: 'Invalid board ID provided.',
      };
    }

    // Verify workspace membership authorization
    const board = await prisma.board.findFirst({
      where: {
        id: boardId.trim(),
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
      },
    });

    if (!board) {
      return {
        success: false,
        message: 'Board not found or access denied.',
      };
    }

    // Fetch tasks belonging to columns in this board
    const rawTasks = await prisma.task.findMany({
      where: {
        column: {
          boardId: board.id,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return {
      success: true,
      tasks: rawTasks.map(formatTask),
    };
  } catch (error) {
    console.error('Error in getBoardTasks:', error);
    return {
      success: false,
      message: 'Failed to retrieve tasks.',
    };
  }
}

/**
 * Server Action: Create a new Task inside a Column.
 * Enforces Zod validation, WorkspaceMember authorization, and order calculation.
 */
export async function createTask(input: unknown): Promise<TaskActionResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to create tasks.',
      };
    }

    const userId = session.user.id;

    // Validate input via Zod
    const validationResult = createTaskSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid task input.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { title, description, priority, columnId, assigneeId } = validationResult.data;

    // Verify column exists and belongs to a workspace where current user is a member
    const column = await prisma.column.findUnique({
      where: { id: columnId },
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
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!column || !column.board.workspace.members.length) {
      return {
        success: false,
        message: 'You do not have access to this column or board.',
      };
    }

    // Verify Assignee belongs to the SAME workspace (STEP 8)
    const cleanAssigneeId = assigneeId ? assigneeId.trim() : null;
    if (cleanAssigneeId) {
      const assigneeMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: cleanAssigneeId,
            workspaceId: column.board.workspaceId,
          },
        },
      });

      if (!assigneeMember) {
        return {
          success: false,
          message: 'The selected assignee is not a member of this workspace.',
        };
      }
    }

    // Determine task order (current max order + 1 or 0 if column is empty)
    const maxTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = maxTask !== null && maxTask !== undefined ? maxTask.order + 1 : 0;

    // Create task in Neon PostgreSQL
    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        columnId,
        order: nextOrder,
        assigneeId: cleanAssigneeId,
        isAiGenerated: false,
        aiReasoning: null,
      },
    });

    return {
      success: true,
      task: formatTask(newTask),
    };
  } catch (error) {
    console.error('Error in createTask action:', error);
    return {
      success: false,
      message: 'Failed to create task due to a database error.',
    };
  }
}

/**
 * Server Action: Update an existing Task's title, description, priority, or assignee.
 * Enforces Zod validation and WorkspaceMember authorization.
 */
export async function updateTask(input: unknown): Promise<TaskActionResult> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to update tasks.',
      };
    }

    const userId = session.user.id;

    // Validate input via Zod
    const validationResult = updateTaskSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid update data.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { taskId, title, description, priority, assigneeId } = validationResult.data;

    // Verify task exists and belongs to a workspace where user is a member
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        column: {
          select: {
            board: {
              select: {
                workspaceId: true,
                workspace: {
                  select: {
                    members: {
                      where: { userId },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingTask || !existingTask.column.board.workspace.members.length) {
      return {
        success: false,
        message: 'Task not found or access denied.',
      };
    }

    // Verify Assignee belongs to the SAME workspace if assigneeId provided (STEP 8)
    const cleanAssigneeId = assigneeId !== undefined ? (assigneeId ? assigneeId.trim() : null) : undefined;

    if (cleanAssigneeId) {
      const assigneeMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: cleanAssigneeId,
            workspaceId: existingTask.column.board.workspaceId,
          },
        },
      });

      if (!assigneeMember) {
        return {
          success: false,
          message: 'The selected assignee is not a member of this workspace.',
        };
      }
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(priority !== undefined && { priority }),
        ...(cleanAssigneeId !== undefined && { assigneeId: cleanAssigneeId }),
      },
    });

    return {
      success: true,
      task: formatTask(updatedTask),
    };
  } catch (error) {
    console.error('Error in updateTask action:', error);
    return {
      success: false,
      message: 'Failed to update task.',
    };
  }
}

/**
 * Server Action: Delete a Task by ID.
 * Enforces WorkspaceMember authorization.
 */
export async function deleteTask(taskIdInput: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to delete tasks.',
      };
    }

    const userId = session.user.id;

    // Extract taskId from string or object
    let taskId: string | undefined;
    if (typeof taskIdInput === 'string') {
      taskId = taskIdInput;
    } else if (typeof taskIdInput === 'object' && taskIdInput !== null) {
      const parsed = deleteTaskSchema.safeParse(taskIdInput);
      if (parsed.success) taskId = parsed.data.taskId;
    }

    if (!taskId || taskId.trim() === '') {
      return {
        success: false,
        message: 'Invalid task ID provided for deletion.',
      };
    }

    const cleanTaskId = taskId.trim();

    // Verify task exists and belongs to workspace where user is a member
    const existingTask = await prisma.task.findUnique({
      where: { id: cleanTaskId },
      select: {
        id: true,
        column: {
          select: {
            board: {
              select: {
                workspace: {
                  select: {
                    members: {
                      where: { userId },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingTask || !existingTask.column.board.workspace.members.length) {
      return {
        success: false,
        message: 'Task not found or access denied.',
      };
    }

    // Delete task from Neon PostgreSQL
    await prisma.task.delete({
      where: { id: cleanTaskId },
    });

    return {
      success: true,
      message: 'Task deleted successfully.',
    };
  } catch (error) {
    console.error('Error in deleteTask action:', error);
    return {
      success: false,
      message: 'Failed to delete task.',
    };
  }
}

/**
 * Server Action: Move a Task within a column or across columns.
 * Enforces Zod validation, auth session check, workspace access check,
 * board matching check (source and destination must belong to same board),
 * and uses an atomic Prisma transaction to reorder tasks cleanly.
 */
export async function moveTask(input: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to move tasks.',
      };
    }

    const userId = session.user.id;

    // Validate input via Zod
    const validationResult = moveTaskSchema.safeParse(input);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid move data.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { taskId, sourceColumnId, destinationColumnId, destinationOrder } = validationResult.data;

    // Fetch existing task and check workspace membership & boardId
    const existingTask = await prisma.task.findUnique({
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
                workspace: {
                  select: {
                    members: {
                      where: { userId },
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingTask || !existingTask.column.board.workspace.members.length) {
      return {
        success: false,
        message: 'Task not found or access denied.',
      };
    }

    if (existingTask.columnId !== sourceColumnId) {
      return {
        success: false,
        message: 'Task does not belong to the specified source column.',
      };
    }

    const boardId = existingTask.column.boardId;

    // Fetch destination column and check it belongs to the SAME board
    const destinationColumn = await prisma.column.findUnique({
      where: { id: destinationColumnId },
      select: {
        id: true,
        boardId: true,
      },
    });

    if (!destinationColumn) {
      return {
        success: false,
        message: 'Destination column not found.',
      };
    }

    if (destinationColumn.boardId !== boardId) {
      return {
        success: false,
        message: 'Cannot move task to a column on a different board.',
      };
    }

    // Perform atomic reordering transaction
    await prisma.$transaction(async (tx) => {
      if (sourceColumnId === destinationColumnId) {
        // SAME COLUMN REORDER
        const columnTasks = await tx.task.findMany({
          where: { columnId: sourceColumnId },
          orderBy: { order: 'asc' },
          select: { id: true, order: true },
        });

        // Filter out moved task
        const otherTasks = columnTasks.filter((t) => t.id !== taskId);
        const clampOrder = Math.max(0, Math.min(destinationOrder, otherTasks.length));

        // Insert moved task at destination index
        otherTasks.splice(clampOrder, 0, { id: taskId, order: existingTask.order });

        // Step 1: Assign temporary negative orders to avoid @@unique([columnId, order]) collision
        for (let i = 0; i < otherTasks.length; i++) {
          await tx.task.update({
            where: { id: otherTasks[i].id },
            data: { order: -(i + 1) },
          });
        }

        // Step 2: Assign final sequential 0-indexed orders
        for (let i = 0; i < otherTasks.length; i++) {
          await tx.task.update({
            where: { id: otherTasks[i].id },
            data: { order: i },
          });
        }
      } else {
        // CROSS COLUMN MOVE
        // 1. Normalize source column tasks (excluding moved task)
        const sourceTasks = await tx.task.findMany({
          where: { columnId: sourceColumnId, NOT: { id: taskId } },
          orderBy: { order: 'asc' },
          select: { id: true },
        });

        for (let i = 0; i < sourceTasks.length; i++) {
          await tx.task.update({
            where: { id: sourceTasks[i].id },
            data: { order: -(i + 1) },
          });
        }
        for (let i = 0; i < sourceTasks.length; i++) {
          await tx.task.update({
            where: { id: sourceTasks[i].id },
            data: { order: i },
          });
        }

        // 2. Insert into destination column
        const destTasks = await tx.task.findMany({
          where: { columnId: destinationColumnId },
          orderBy: { order: 'asc' },
          select: { id: true },
        });

        const clampOrder = Math.max(0, Math.min(destinationOrder, destTasks.length));
        destTasks.splice(clampOrder, 0, { id: taskId });

        // Set temporary negative orders & update columnId for moved task
        for (let i = 0; i < destTasks.length; i++) {
          await tx.task.update({
            where: { id: destTasks[i].id },
            data: {
              order: -(i + 1),
              columnId: destinationColumnId,
            },
          });
        }
        // Set final 0-indexed orders
        for (let i = 0; i < destTasks.length; i++) {
          await tx.task.update({
            where: { id: destTasks[i].id },
            data: { order: i },
          });
        }
      }
    });

    return {
      success: true,
      message: 'Task position updated successfully.',
    };
  } catch (error) {
    console.error('Error in moveTask action:', error);
    return {
      success: false,
      message: 'Failed to move task due to a database error.',
    };
  }
}

