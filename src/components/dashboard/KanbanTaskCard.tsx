'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { type TaskDto } from '@/actions/task';

interface KanbanTaskCardProps {
  task: TaskDto;
  columnName: string;
  onEdit: (task: TaskDto, columnName: string) => void;
  onDelete: (task: TaskDto) => void;
  isOverlay?: boolean;
}

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'HIGH':
      return 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30';
    case 'MEDIUM':
      return 'bg-[#0d4652]/70 text-[#2dd4bf] border-[#2dd4bf]/20';
    case 'LOW':
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

export default function KanbanTaskCard({
  task,
  columnName,
  onEdit,
  onDelete,
  isOverlay = false,
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-4 rounded-xl bg-[#030d10]/90 border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/60 transition-all shadow-md hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] space-y-2.5 touch-none ${
        isOverlay ? 'shadow-2xl border-[#2dd4bf] scale-105 z-50 bg-[#07252d]' : ''
      }`}
    >
      {/* Task Top Header: Title, Grip & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-[#2dd4bf] transition-colors flex-shrink-0 mt-0.5" />
          <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#2dd4bf] transition-colors leading-snug break-words">
            {task.title}
          </h4>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task, columnName);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#072229] transition-colors"
            title="Edit Task"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 break-words whitespace-pre-wrap pl-6">
          {task.description}
        </p>
      )}

      {/* Task Footer: Priority Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2dd4bf]/10 text-[10px]">
        <span
          className={`font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadgeClass(
            task.priority
          )}`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );
}
