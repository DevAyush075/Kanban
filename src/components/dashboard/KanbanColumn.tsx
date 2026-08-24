'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Kanban as KanbanIcon } from 'lucide-react';
import { type BoardColumnDto } from '@/actions/board';
import { type TaskDto } from '@/actions/task';
import KanbanTaskCard from './KanbanTaskCard';

interface KanbanColumnProps {
  column: BoardColumnDto;
  onOpenCreateTask: (columnId: string, columnName: string) => void;
  onOpenEditTask: (task: TaskDto, columnName: string) => void;
  onOpenDeleteTask: (task: TaskDto) => void;
}

export default function KanbanColumn({
  column,
  onOpenCreateTask,
  onOpenEditTask,
  onOpenDeleteTask,
}: KanbanColumnProps) {
  const taskList = column.tasks || [];
  const taskIds = taskList.map((t) => t.id);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl bg-[#07252d]/60 backdrop-blur-xl border transition-all p-4 space-y-3 flex flex-col min-h-[460px] ${
        isOver ? 'border-[#2dd4bf] ring-1 ring-[#2dd4bf]/50 bg-[#07252d]/90' : 'border-[#2dd4bf]/20'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2dd4bf]/15">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            {column.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#030d10] text-[#2dd4bf] border border-[#2dd4bf]/20">
            {taskList.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenCreateTask(column.id, column.name)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#072229] transition-colors"
          title="Add Task"
        >
          <Plus className="w-4 h-4 text-[#2dd4bf]" />
        </button>
      </div>

      {/* Tasks List Container with SortableContext */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 min-h-[120px]">
          {taskList.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#2dd4bf]/15 rounded-xl bg-[#030d10]/40 my-auto space-y-2">
              <KanbanIcon className="w-5 h-5 text-slate-500" />
              <p className="text-xs font-medium text-slate-400">No tasks yet</p>
            </div>
          ) : (
            taskList.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                columnName={column.name}
                onEdit={onOpenEditTask}
                onDelete={onOpenDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add Task Button at bottom of column */}
      <button
        type="button"
        onClick={() => onOpenCreateTask(column.id, column.name)}
        className="w-full py-2 rounded-xl border border-dashed border-[#2dd4bf]/20 text-xs font-semibold text-slate-400 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/40 hover:bg-[#07252d]/40 transition-colors flex items-center justify-center gap-1.5 mt-auto"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </div>
  );
}
