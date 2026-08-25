'use server';

import { prisma } from '@/lib/prisma';
import { getAuthSession, requireBoardAccess } from '@/lib/auth-helpers';
import { getAiClient } from '@/lib/ai/client';
import {
  askAssistantInputSchema,
  assistantResponseSchema,
  type AssistantResponse,
} from '@/lib/validations/ai-assistant';

export interface AskAssistantResult {
  success: boolean;
  message?: string;
  response?: AssistantResponse;
}

const ASSISTANT_SYSTEM_INSTRUCTION = `You are an experienced software project manager and technical engineering assistant for a Kanban board application.
Your responsibility is to analyze the user's board context and answer their question clearly, providing evidence-based recommendations.

RULES YOU MUST FOLLOW STRICTLY:
1. ONLY reason using the supplied board context. Do NOT invent tasks, users, or project information.
2. Clearly distinguish facts from recommendations.
3. Recommend practical next actions based on priority, status, and dependencies.
4. DO NOT modify data, NEVER execute database commands, and NEVER expose internal implementation details (e.g. database UUIDs) to the user. Use clear task titles.
5. If the board is completely empty of tasks, politely state that the board has no tasks yet and recommend creating the first set of tasks.
6. Output ONLY a valid JSON object matching this exact schema:
   {
     "answer": "Detailed answer, analysis, or summary (max 1000 chars)",
     "recommendations": [
       {
         "taskId": "The actual task title or ID to work on",
         "reason": "Why this task is recommended (priority, blockers, etc.)"
       }
     ],
     "risks": [
       "Risk 1 (e.g., High priority task stuck in progress)",
       "Risk 2"
     ],
     "nextActions": [
       "Actionable next step 1",
       "Actionable next step 2"
     ]
   }

Ensure your JSON is valid. Do not wrap in markdown fences if possible, or if you do, it will be stripped.`;

export async function askProjectAssistant(input: unknown): Promise<AskAssistantResult> {
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
    const validationResult = askAssistantInputSchema.safeParse(input);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid assistant prompt input.';
      return {
        success: false,
        message: firstError,
      };
    }

    const { boardId, question } = validationResult.data;

    // 3. Verify user has access to board
    const boardAccess = await requireBoardAccess(boardId, authCtx.userId);
    if (!boardAccess) {
      return {
        success: false,
        message: 'Unauthorized. Board not found or access denied.',
      };
    }

    // 4. Create initial AiLog record
    const logRecord = await prisma.aiLog.create({
      data: {
        prompt: `ASSISTANT QUERY: ${question}`,
        status: 'GENERATING',
        boardId,
      },
    });
    aiLogId = logRecord.id;

    // 5. Load Board Context from Neon DB
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
                id: true,
                title: true,
                description: true,
                priority: true,
                order: true,
                isAiGenerated: true,
                createdAt: true,
                updatedAt: true,
                subTasks: {
                  select: {
                    id: true,
                    title: true,
                    priority: true,
                  },
                },
              },
              orderBy: [
                { priority: 'desc' }, // Simple heuristics to prioritize high priority tasks in context limits
                { updatedAt: 'desc' },
              ],
              take: 30, // Limit context to 30 tasks per column to prevent huge context
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!boardData) {
      return {
        success: false,
        message: 'Board not found.',
      };
    }

    // 6. Server-side calculations (Metrics)
    let totalTasks = 0;
    let completedTasks = 0;
    let highPriorityRemaining = 0;

    // We assume the last column is "Done" or "Completed" by standard convention, 
    // or we can count any column with "Done" in the name.
    const columns = boardData.columns;
    const completedColumnIds = columns
      .filter((c) => c.name.toLowerCase().includes('done') || c.name.toLowerCase().includes('complete') || c.order === columns.length - 1)
      .map((c) => c.id);

    const simplifiedColumns = columns.map((col) => {
      const isCompletedCol = completedColumnIds.includes(col.id);
      
      const simplifiedTasks = col.tasks.map((task) => {
        totalTasks++;
        if (isCompletedCol) {
          completedTasks++;
        } else if (task.priority === 'HIGH' || task.priority === 'URGENT') {
          highPriorityRemaining++;
        }

        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          description: task.description ? task.description.substring(0, 100) + '...' : null,
          subtasksCount: task.subTasks.length,
          updatedAt: task.updatedAt,
        };
      });

      return {
        name: col.name,
        tasks: simplifiedTasks,
      };
    });

    const completedPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const metrics = {
      totalTasks,
      completedTasks,
      completedPercentage: `${completedPercentage}%`,
      highPriorityRemaining,
    };

    // 7. Check AI API Client Configuration
    const aiClient = getAiClient();
    if (!aiClient) {
      // Mock response for testing without API Key
      const fallbackResponse: AssistantResponse = {
        answer: `This is a mock response. You asked: "${question}". The board has ${totalTasks} tasks (${completedPercentage}% complete).`,
        recommendations: [
          { taskId: "Example Task", reason: "AI API Key not configured. This is mock data." }
        ],
        risks: ["AI API Key is missing"],
        nextActions: ["Configure GEMINI_API_KEY in .env"],
      };

      await prisma.aiLog.update({
        where: { id: aiLogId },
        data: { status: 'COMPLETED' },
      });

      return {
        success: true,
        response: fallbackResponse,
      };
    }

    // 8. Build LLM Context & Prompt
    const contextPayload = {
      boardName: boardData.name,
      metrics,
      columns: simplifiedColumns,
    };

    const fullPrompt = `${ASSISTANT_SYSTEM_INSTRUCTION}

BOARD CONTEXT JSON:
${JSON.stringify(contextPayload, null, 2)}

USER QUESTION:
"${question}"

Analyze the board context and output the JSON response now:`;

    // 9. Call Gemini API
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const rawResponseText = response.text || '';
    const cleanedJsonText = rawResponseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    if (!cleanedJsonText) {
      throw new Error('Received empty response from AI provider.');
    }

    const parsedJson = JSON.parse(cleanedJsonText);

    // 10. Validate LLM response with Zod
    const proposalValidation = assistantResponseSchema.safeParse(parsedJson);

    if (!proposalValidation.success) {
      console.error('AI assistant validation failed:', proposalValidation.error);
      throw new Error('AI output did not match expected structured JSON schema.');
    }

    // Update AiLog status to COMPLETED
    await prisma.aiLog.update({
      where: { id: aiLogId },
      data: { status: 'COMPLETED' },
    });

    return {
      success: true,
      response: proposalValidation.data,
    };
  } catch (error) {
    console.error('Error in AI Assistant:', error);

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
      message: 'Failed to process your request. Please try again.',
    };
  }
}
