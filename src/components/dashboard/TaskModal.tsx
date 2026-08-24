'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Check, Tag } from 'lucide-react';
import { createTask, updateTask, type TaskDto } from '@/actions/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnName: string;
  taskToEdit?: TaskDto | null;
  onSuccess: (task: TaskDto, isEdit: boolean) => void;
}

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-800 border-slate-700 text-slate-300' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-[#0d4652]/60 border-[#2dd4bf]/30 text-[#2dd4bf]' },
  { value: 'HIGH', label: 'High', color: 'bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-rose-500/10 border-rose-500/30 text-rose-300' },
] as const;

export default function TaskModal({
  isOpen,
  onClose,
  columnId,
  columnName,
  taskToEdit,
  onSuccess,
}: TaskModalProps) {
  const isEditMode = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
    }
    setError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    if (isEditMode && taskToEdit) {
      const res = await updateTask({
        taskId: taskToEdit.id,
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
      });

      if (!res.success || !res.task) {
        setError(res.message || 'Failed to update task.');
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.task, true);
    } else {
      const res = await createTask({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        columnId,
      });

      if (!res.success || !res.task) {
        setError(res.message || 'Failed to create task.');
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.task, false);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2dd4bf]/15 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Column: <strong className="text-[#2dd4bf]">{columnName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title <span className="text-[#2dd4bf]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Implement OAuth2 Refresh Token Flow"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, sub-requirements, or context..."
              rows={3}
              disabled={isSubmitting}
              className="w-full p-3.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] disabled:opacity-50"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as typeof priority)}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${p.color} ${
                      isSelected ? 'ring-2 ring-[#2dd4bf] scale-[1.02]' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2dd4bf]/15">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_15px_rgba(45,212,191,0.25)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
