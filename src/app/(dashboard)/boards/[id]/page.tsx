'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  ArrowLeft,
  Kanban as KanbanIcon,
  ShieldAlert,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import TaskModal from '@/components/dashboard/TaskModal';
import ConfirmDeleteModal from '@/components/dashboard/ConfirmDeleteModal';
import AiPlanModal from '@/components/dashboard/AiPlanModal';
import KanbanColumn from '@/components/dashboard/KanbanColumn';
import KanbanTaskCard from '@/components/dashboard/KanbanTaskCard';
import { getBoardById, type BoardColumnDto } from '@/actions/board';
import { moveTask, type TaskDto } from '@/actions/task';

interface BoardDetails {
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
}

export default function IndividualBoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params?.id as string;

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [columns, setColumns] = useState<BoardColumnDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<{ id: string; name: string } | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<TaskDto | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Drag Overlay Active State
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);

  // DND Kit Sensors (minimum distance threshold to prevent accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBoardData = async () => {
    if (!boardId) return;
    const res = await getBoardById(boardId);
    if (res.success && res.board) {
      setBoard(res.board);
      setColumns(res.board.columns || []);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchBoard() {
      if (!boardId) {
        setError('No board ID provided.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await getBoardById(boardId);

      if (!isMounted) return;

      if (!res.success || !res.board) {
        setError(res.message || 'Failed to load board.');
        setBoard(null);
        setColumns([]);
        if (res.message?.toLowerCase().includes('unauthorized') || res.message?.toLowerCase().includes('sign in')) {
          router.push('/login');
          return;
        }
      } else {
        setBoard(res.board);
        setColumns(res.board.columns || []);
      }

      setIsLoading(false);
    }

    fetchBoard();

    return () => {
      isMounted = false;
    };
  }, [boardId]);

  // Open Create Modal for a Column
  const handleOpenCreateTask = (columnId: string, columnName: string) => {
    setActiveColumn({ id: columnId, name: columnName });
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Open Edit Modal for a Task
  const handleOpenEditTask = (task: TaskDto, columnName: string) => {
    setActiveColumn({ id: task.columnId, name: columnName });
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Open Delete Modal for a Task
  const handleOpenDeleteTask = (task: TaskDto) => {
    setTaskToDelete({ id: task.id, title: task.title });
    setIsDeleteModalOpen(true);
  };

  // Task Creation or Edit Success Handler
  const handleTaskSaved = (savedTask: TaskDto, isEdit: boolean) => {
    setColumns((prevCols) =>
      prevCols.map((col) => {
        if (col.id !== savedTask.columnId) return col;

        const currentTasks = col.tasks || [];
        if (isEdit) {
          return {
            ...col,
            tasks: currentTasks.map((t) => (t.id === savedTask.id ? savedTask : t)),
          };
        }

        return {
          ...col,
          tasks: [...currentTasks, savedTask],
        };
      })
    );
  };

  // Task Deletion Success Handler
  const handleTaskDeleted = (deletedTaskId: string) => {
    setColumns((prevCols) =>
      prevCols.map((col) => ({
        ...col,
        tasks: (col.tasks || []).filter((t) => t.id !== deletedTaskId),
      }))
    );
  };

  // Drag & Drop Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as TaskDto | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    // Find source column and task
    let sourceColumn: BoardColumnDto | undefined;
    let draggedTask: TaskDto | undefined;

    for (const col of columns) {
      const found = (col.tasks || []).find((t) => t.id === activeTaskId);
      if (found) {
        sourceColumn = col;
        draggedTask = found;
        break;
      }
    }

    if (!sourceColumn || !draggedTask) return;

    // Find destination column and target index
    let destinationColumn: BoardColumnDto | undefined;
    let destinationOrder = 0;

    // Check if over target is a column ID directly
    const directCol = columns.find((c) => c.id === overId);
    if (directCol) {
      destinationColumn = directCol;
      destinationOrder = (directCol.tasks || []).length;
    } else {
      // Over target is another task card
      for (const col of columns) {
        const foundIndex = (col.tasks || []).findIndex((t) => t.id === overId);
        if (foundIndex !== -1) {
          destinationColumn = col;
          destinationOrder = foundIndex;
          break;
        }
      }
    }

    if (!destinationColumn) return;

    const sourceColumnId = sourceColumn.id;
    const destinationColumnId = destinationColumn.id;

    // Check if task dropped in exact same spot
    if (sourceColumnId === destinationColumnId) {
      const currentTasks = sourceColumn.tasks || [];
      const oldIndex = currentTasks.findIndex((t) => t.id === activeTaskId);
      if (oldIndex === destinationOrder || oldIndex === -1) return;
    }

    // Save current snapshot for optimistic rollback
    const previousColumnsSnapshot = [...columns];

    // Compute Optimistic State
    let newColumns: BoardColumnDto[] = [];

    if (sourceColumnId === destinationColumnId) {
      // Same Column Reordering
      newColumns = columns.map((col) => {
        if (col.id !== sourceColumnId) return col;

        const currentTasks = col.tasks || [];
        const oldIndex = currentTasks.findIndex((t) => t.id === activeTaskId);
        if (oldIndex === -1) return col;

        const reorderedTasks = arrayMove(currentTasks, oldIndex, destinationOrder).map((t, idx) => ({
          ...t,
          order: idx,
        }));

        return { ...col, tasks: reorderedTasks };
      });
    } else {
      // Cross Column Movement
      newColumns = columns.map((col) => {
        if (col.id === sourceColumnId) {
          // Remove from source column & normalize orders
          const updatedTasks = (col.tasks || [])
            .filter((t) => t.id !== activeTaskId)
            .map((t, idx) => ({ ...t, order: idx }));
          return { ...col, tasks: updatedTasks };
        }

        if (col.id === destinationColumnId) {
          // Insert into destination column
          const destTasks = [...(col.tasks || [])];
          const updatedMovedTask: TaskDto = {
            ...draggedTask!,
            columnId: destinationColumnId,
            order: destinationOrder,
          };
          destTasks.splice(destinationOrder, 0, updatedMovedTask);

          const finalTasks = destTasks.map((t, idx) => ({ ...t, order: idx }));
          return { ...col, tasks: finalTasks };
        }

        return col;
      });
    }

    // Update UI immediately (Optimistic UI)
    setColumns(newColumns);
    setMoveError(null);

    // Call moveTask Server Action
    const res = await moveTask({
      taskId: activeTaskId,
      sourceColumnId,
      destinationColumnId,
      destinationOrder,
    });

    if (!res.success) {
      // Rollback UI on failure
      setColumns(previousColumnsSnapshot);
      setMoveError(res.message || 'Failed to move task. Reverted changes.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24]">
      {/* Top Navbar */}
      <DashboardHeader onAiPromptClick={() => setIsAiModalOpen(true)} />

      {/* Board Secondary Sub-Header */}
      <div className="bg-[#072229]/60 border-b border-[#2dd4bf]/15 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg bg-[#07252d] border border-[#2dd4bf]/20 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  {isLoading ? 'Loading Board...' : board ? board.name : 'Board Page'}
                </h1>
                {board && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
                    Active Board
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {board ? `Workspace: ${board.workspace.name}` : 'Kanban Workspace'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0d4652] to-[#07252d] border border-[#2dd4bf]/40 text-xs font-semibold text-[#2dd4bf] hover:text-white hover:border-[#2dd4bf] transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] animate-pulse" />
              <span>AI Plan Generator</span>
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#07252d] border border-[#2dd4bf]/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-[#2dd4bf]/40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto max-w-7xl mx-auto w-full flex flex-col">
        {/* Drag Failure Toast Banner */}
        {moveError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{moveError}</span>
            </div>
            <button
              onClick={() => setMoveError(null)}
              className="text-slate-400 hover:text-white text-xs underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 my-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] animate-spin" />
              <KanbanIcon className="w-5 h-5 text-[#2dd4bf] absolute inset-0 m-auto" />
            </div>
            <p className="text-xs font-semibold text-slate-400 animate-pulse">
              Retrieving real board &amp; tasks from database...
            </p>
          </div>
        )}

        {/* Error / Not Found / Unauthorized State */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center p-6 my-12">
            <div className="max-w-md w-full p-8 rounded-3xl bg-[#07252d]/90 backdrop-blur-xl border border-rose-500/30 shadow-2xl text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Unable to Access Board
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success Drag & Drop Kanban Board UI */}
        {!isLoading && !error && board && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onOpenCreateTask={handleOpenCreateTask}
                  onOpenEditTask={handleOpenEditTask}
                  onOpenDeleteTask={handleOpenDeleteTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <KanbanTaskCard
                  task={activeTask}
                  columnName=""
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      {activeColumn && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          columnId={activeColumn.id}
          columnName={activeColumn.name}
          taskToEdit={taskToEdit}
          onSuccess={handleTaskSaved}
        />
      )}

      {/* Task Delete Confirmation Modal */}
      {taskToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          taskId={taskToDelete.id}
          taskTitle={taskToDelete.title}
          onSuccess={handleTaskDeleted}
        />
      )}

      {/* AI Plan Generation & Proposal Approval Modal */}
      {board && (
        <AiPlanModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          boardId={board.id}
          boardName={board.name}
          onPlanApplied={fetchBoardData}
        />
      )}
    </div>
  );
}
