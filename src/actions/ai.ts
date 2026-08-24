'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession, requireBoardAccess } from '@/lib/auth-helpers';
import {
  generatePlanInputSchema,
  applyPlanInputSchema,
  aiProposalSchema,
  type AiProposal,
  type ProposedTask,
  type ProposedSubtask,
} from '@/lib/validations/ai';
import { getAiClient, SYSTEM_INSTRUCTION } from '@/lib/ai/client';

export interface GeneratePlanResult {
  success: boolean;
  message?: string;
  proposal?: AiProposal;
}

export interface ApplyPlanResult {
  success: boolean;
  message?: string;
  createdCount?: number;
}

/**
 * Level 2 Duplicate Detection Helper: Normalizes task titles for comparison.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Server Action: Generates a hierarchical AI project plan proposal for a board.
 * Enforces session authentication, board access authorization, Zod validation,
 * Level 2 duplicate detection, and AiLog audit tracking.
 * MUST NOT modify tasks in the database.
 */
export async function generateProjectPlan(input: unknown): Promise<GeneratePlanResult> {
  let aiLogId: string | null = null;

  try {
    // 1. Authenticate user
    const authCtx = await getAuthSession();
    if (!authCtx) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to use the AI Assistant.',
      };
    }

    // 2. Validate input via Zod
    const validationResult = generatePlanInputSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid AI prompt input.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { boardId, prompt } = validationResult.data;

    // 3. Verify user has access to board
    const boardAccess = await requireBoardAccess(boardId, authCtx.userId);
    if (!boardAccess) {
      return {
        success: false,
        message: 'Board not found or access denied.',
      };
    }

    // 4. Load Board Context from Neon DB (columns, existing tasks & descriptions)
    const boardData = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        name: true,
        columns: {
          select: {
            id: true,
            name: true,
            order: true,
            tasks: {
              select: {
                title: true,
                description: true,
              },
              take: 50,
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!boardData || !boardData.columns.length) {
      return {
        success: false,
        message: 'Board has no columns configured. Cannot generate plan.',
      };
    }

    // 5. Create initial AiLog record (Status: GENERATING)
    const logRecord = await prisma.aiLog.create({
      data: {
        prompt,
        status: 'GENERATING',
        boardId,
      },
    });
    aiLogId = logRecord.id;

    // Build normalized set of existing titles for Level 2 duplicate detection
    const existingTaskTitles = boardData.columns.flatMap((c) => c.tasks.map((t) => t.title));
    const normalizedExistingSet = new Set(existingTaskTitles.map(normalizeTitle));
    const availableColumnNames = boardData.columns.map((c) => c.name);

    // 6. Check AI API Client Configuration
    const aiClient = getAiClient();
    if (!aiClient) {
      // Fallback hierarchical proposal if no API key is configured in environment
      const defaultColumnName = boardData.columns[0].name;

      const fallbackProposal: AiProposal = {
        summary: `AI Project Plan for "${prompt.trim()}". (Demo mode: set AI_API_KEY or GEMINI_API_KEY for live LLM generation).`,
        tasks: [
          {
            title: `Implement core functionality for ${prompt.substring(0, 30)}`,
            description: `Design and build the primary components for: ${prompt}`,
            priority: 'HIGH',
            column: defaultColumnName,
            reasoning: 'Primary core requirement for feature execution.',
            subtasks: [
              {
                title: 'Design UI layout and schema definitions',
                description: 'Define component structure and data contracts.',
                priority: 'HIGH',
                reasoning: 'Foundation for implementation.',
              },
              {
                title: 'Implement API routes & authentication middleware',
                description: 'Secure backend handlers and parameter validation.',
                priority: 'HIGH',
                reasoning: 'Backend integration requirement.',
              },
              {
                title: 'Write unit tests & manual QA check',
                description: 'Validate edge cases and state transitions.',
                priority: 'MEDIUM',
                reasoning: 'Quality assurance step.',
              },
            ],
          },
          {
            title: `Integrate user workflow & error handling`,
            description: `Connect client interactions with state feedback and toast error alerts.`,
            priority: 'MEDIUM',
            column: defaultColumnName,
            reasoning: 'Enhances user experience and reliability.',
            subtasks: [
              {
                title: 'Add loading spinners and error alert banners',
                description: 'UX visual feedback during API calls.',
                priority: 'MEDIUM',
                reasoning: 'User feedback enhancement.',
              },
            ],
          },
        ],
      };

      await prisma.aiLog.update({
        where: { id: aiLogId },
        data: { status: 'COMPLETED' },
      });

      return {
        success: true,
        proposal: fallbackProposal,
      };
    }

    // 7. Build LLM Context & Prompt
    const contextPayload = {
      boardName: boardData.name,
      availableColumns: availableColumnNames,
      existingTasks: existingTaskTitles,
      userPrompt: prompt,
    };

    const fullPrompt = `${SYSTEM_INSTRUCTION}

BOARD CONTEXT JSON:
${JSON.stringify(contextPayload, null, 2)}

USER REQUEST:
"${prompt}"

Produce your JSON proposal now:`;

    // 8. Call Gemini API via @google/genai SDK
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const rawResponseText = response.text || '';

    // Sanitize response text by stripping markdown JSON fences if present
    const cleanedJsonText = rawResponseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    if (!cleanedJsonText) {
      throw new Error('Received empty response from AI provider.');
    }

    const parsedJson = JSON.parse(cleanedJsonText);

    // 9. Validate LLM response with Zod
    const proposalValidation = aiProposalSchema.safeParse(parsedJson);

    if (!proposalValidation.success) {
      console.error('AI proposal validation failed:', proposalValidation.error);
      throw new Error('AI output did not match expected structured JSON schema.');
    }

    const validProposal = proposalValidation.data;

    // 10. Level 2 Duplicate Detection & Column Sanitization
    const sanitizedTasks: ProposedTask[] = [];

    for (const task of validProposal.tasks) {
      const normTitle = normalizeTitle(task.title);

      // Skip if task title is a duplicate of an existing task on the board
      if (normalizedExistingSet.has(normTitle)) {
        continue;
      }

      // Map column name safely to existing board column
      const matchedColumn = availableColumnNames.find(
        (colName) => colName.toLowerCase() === task.column.toLowerCase()
      );
      const targetColumn = matchedColumn || availableColumnNames[0];

      // Filter subtasks for duplicates
      const sanitizedSubtasks: ProposedSubtask[] = (task.subtasks || []).filter((sub) => {
        const subNorm = normalizeTitle(sub.title);
        return !normalizedExistingSet.has(subNorm);
      });

      sanitizedTasks.push({
        ...task,
        column: targetColumn,
        subtasks: sanitizedSubtasks,
      });
    }

    // Ensure at least 1 task remains
    if (sanitizedTasks.length === 0) {
      return {
        success: false,
        message: 'The proposed tasks already exist on your board. Please refine your request.',
      };
    }

    const finalProposal: AiProposal = {
      summary: validProposal.summary,
      tasks: sanitizedTasks,
    };

    // Update AiLog status to COMPLETED
    await prisma.aiLog.update({
      where: { id: aiLogId },
      data: { status: 'COMPLETED' },
    });

    return {
      success: true,
      proposal: finalProposal,
    };
  } catch (error) {
    console.error('Error generating AI project plan:', error);

    if (aiLogId) {
      try {
        await prisma.aiLog.update({
          where: { id: aiLogId },
          data: { status: 'FAILED' },
        });
      } catch (logErr) {
        console.error('Failed to update AiLog status:', logErr);
      }
    }

    return {
      success: false,
      message: 'Failed to generate AI plan. Please try again with a clearer prompt.',
    };
  }
}

/**
 * Server Action: Applies an approved hierarchical AI project plan proposal.
 * Re-authenticates user, re-verifies board access, re-validates proposal,
 * and creates parent tasks and child subtasks with parentId inside an atomic Prisma $transaction.
 */
export async function applyAiPlan(input: unknown): Promise<ApplyPlanResult> {
  try {
    // 1. Re-authenticate user
    const authCtx = await getAuthSession();
    if (!authCtx) {
      return {
        success: false,
        message: 'Unauthorized. Please sign in to apply AI tasks.',
      };
    }

    // 2. Validate input via Zod
    const validationResult = applyPlanInputSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid plan application input.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { boardId, proposal } = validationResult.data;

    // 3. Re-verify user has access to board
    const boardAccess = await requireBoardAccess(boardId, authCtx.userId);
    if (!boardAccess) {
      return {
        success: false,
        message: 'Board not found or access denied.',
      };
    }

    // 4. Load board columns to resolve column IDs
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        columns: {
          select: {
            id: true,
            name: true,
            order: true,
            tasks: {
              select: { order: true },
              orderBy: { order: 'desc' },
              take: 1,
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board || !board.columns.length) {
      return {
        success: false,
        message: 'Board columns not found.',
      };
    }

    // Map column names to IDs & track current max order
    const columnMap = new Map<string, { id: string; currentMaxOrder: number }>();

    for (const col of board.columns) {
      const maxOrder = col.tasks.length > 0 ? col.tasks[0].order : -1;
      columnMap.set(col.name.toLowerCase(), { id: col.id, currentMaxOrder: maxOrder });
    }

    const defaultColumnName = board.columns[0].name.toLowerCase();
    const columnOrderOffset = new Map<string, number>();

    // 5. Atomic Prisma $transaction (Parent Tasks + Subtasks + AiLog)
    const createdCount = await prisma.$transaction(async (tx) => {
      let totalCreated = 0;

      for (const proposedTask of proposal.tasks) {
        const colNameLower = proposedTask.column.toLowerCase();
        const targetColInfo = columnMap.get(colNameLower) || columnMap.get(defaultColumnName)!;
        const targetColId = targetColInfo.id;

        const currentOffset = columnOrderOffset.get(targetColId) ?? 0;
        const nextOrder = targetColInfo.currentMaxOrder + currentOffset + 1;
        columnOrderOffset.set(targetColId, currentOffset + 1);

        // Create Parent Task
        const parentTask = await tx.task.create({
          data: {
            title: proposedTask.title,
            description: proposedTask.description || null,
            priority: proposedTask.priority || 'MEDIUM',
            columnId: targetColId,
            order: nextOrder,
            isAiGenerated: true,
            aiReasoning: proposedTask.reasoning || proposal.summary,
          },
        });
        totalCreated++;

        // Create Subtasks linked by parentId if present
        if (proposedTask.subtasks && proposedTask.subtasks.length > 0) {
          for (let subIdx = 0; subIdx < proposedTask.subtasks.length; subIdx++) {
            const sub = proposedTask.subtasks[subIdx];
            await tx.task.create({
              data: {
                title: sub.title,
                description: sub.description || null,
                priority: sub.priority || 'MEDIUM',
                columnId: targetColId,
                parentId: parentTask.id,
                order: subIdx,
                isAiGenerated: true,
                aiReasoning: sub.reasoning || proposedTask.reasoning || proposal.summary,
              },
            });
            totalCreated++;
          }
        }
      }

      // Log successful AI plan application
      await tx.aiLog.create({
        data: {
          prompt: `Applied AI Plan (${totalCreated} items): ${proposal.summary}`,
          status: 'COMPLETED',
          boardId,
        },
      });

      return totalCreated;
    });

    return {
      success: true,
      message: `Successfully created ${createdCount} AI tasks & subtasks on your board!`,
      createdCount,
    };
  } catch (error) {
    console.error('Error applying AI plan:', error);

    return {
      success: false,
      message: 'Failed to apply AI plan. Transaction rolled back cleanly.',
    };
  }
}
