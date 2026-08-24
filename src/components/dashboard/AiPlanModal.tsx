'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Tag,
  RotateCcw,
  Check,
  Trash2,
  CornerDownRight,
  GitCommit,
} from 'lucide-react';
import RobotMascot3D from '@/components/landing/RobotMascot3D';
import {
  generateProjectPlan,
  applyAiPlan,
  type GeneratePlanResult,
  type ApplyPlanResult,
} from '@/actions/ai';
import { type AiProposal, type ProposedTask } from '@/lib/validations/ai';

interface AiPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
  onPlanApplied?: () => void;
}

const PRESET_PROMPTS = [
  'Break down implementing OAuth2 authentication & JWT sessions',
  'Create a sprint for launching a responsive e-commerce checkout flow',
  'Tasks for refactoring database models & API rate limiting',
  'Mobile app release checklist with push notifications & testing',
];

const PRIORITY_BADGES = {
  LOW: 'bg-slate-800 border-slate-700 text-slate-300',
  MEDIUM: 'bg-[#0d4652]/60 border-[#2dd4bf]/30 text-[#2dd4bf]',
  HIGH: 'bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]',
  URGENT: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
};

export default function AiPlanModal({
  isOpen,
  onClose,
  boardId,
  boardName,
  onPlanApplied,
}: AiPlanModalProps) {
  const [mounted, setMounted] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [step, setStep] = useState<'input' | 'generating' | 'proposal' | 'applying'>('input');
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setProposal(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed.length < 5) {
      setError('Prompt must be at least 5 characters long.');
      return;
    }

    setStep('generating');
    setError(null);
    setSuccessMessage(null);

    const res: GeneratePlanResult = await generateProjectPlan({
      boardId,
      prompt: trimmed,
    });

    if (!res.success || !res.proposal) {
      setError(res.message || 'Failed to generate AI proposal.');
      setStep('input');
      return;
    }

    setProposal(res.proposal);
    setStep('proposal');
  };

  const handleRemoveParentTask = (taskIndex: number) => {
    if (!proposal) return;
    const updatedTasks = proposal.tasks.filter((_, idx) => idx !== taskIndex);
    if (updatedTasks.length === 0) {
      setError('Proposal must contain at least one task.');
      return;
    }
    setProposal({
      ...proposal,
      tasks: updatedTasks,
    });
  };

  const handleRemoveSubtask = (parentIndex: number, subtaskIndex: number) => {
    if (!proposal) return;
    const updatedTasks = proposal.tasks.map((task, idx) => {
      if (idx !== parentIndex) return task;
      const updatedSubtasks = (task.subtasks || []).filter((_, sIdx) => sIdx !== subtaskIndex);
      return { ...task, subtasks: updatedSubtasks };
    });
    setProposal({
      ...proposal,
      tasks: updatedTasks,
    });
  };

  const handleApplyPlan = async () => {
    if (!proposal || proposal.tasks.length === 0) {
      setError('Cannot apply empty proposal.');
      return;
    }

    setStep('applying');
    setError(null);

    const res: ApplyPlanResult = await applyAiPlan({
      boardId,
      proposal,
    });

    if (!res.success) {
      setError(res.message || 'Failed to apply AI tasks.');
      setStep('proposal');
      return;
    }

    setSuccessMessage(res.message || 'AI tasks created successfully!');

    setTimeout(() => {
      if (onPlanApplied) onPlanApplied();
      onClose();
    }, 1200);
  };

  const totalTaskCount = proposal
    ? proposal.tasks.reduce((sum, t) => sum + 1 + (t.subtasks ? t.subtasks.length : 0), 0)
    : 0;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2dd4bf]/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0d4652] text-[#fbbf24]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                AI Project Manager
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
                  Task Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Board: <strong className="text-[#2dd4bf]">{boardName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={step === 'generating' || step === 'applying'}
            className="p-1.5 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Prompt Input Form */}
          {step === 'input' && (
            <form onSubmit={handleGenerateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Describe Your Goal or Feature Request
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Build an AI-driven sprint for implementing user role permissions, team invites, and task assignment notifications..."
                  rows={4}
                  required
                  className="w-full p-4 rounded-2xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] leading-relaxed"
                />
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Examples
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROMPTS.map((pText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPrompt(pText);
                        if (error) setError(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50 text-[11px] text-slate-300 hover:text-white transition-all text-left truncate max-w-xs"
                    >
                      {pText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2dd4bf]/15">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] text-[#030a0d] text-xs font-bold hover:from-[#f59e0b] hover:to-[#ffd700] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Generate Task Hierarchy</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Generating State */}
          {step === 'generating' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-28 h-28">
                <RobotMascot3D className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-white font-['Space_Grotesk']">
                  <Loader2 className="w-4 h-4 text-[#2dd4bf] animate-spin" />
                  <span>Decomposing Tasks &amp; Subtasks...</span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Gemini AI is analyzing board context, evaluating priority rules, and checking duplicate tasks.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Hierarchical Proposal Preview & Approval State */}
          {(step === 'proposal' || step === 'applying') && proposal && (
            <div className="space-y-5">
              
              {/* Proposal Summary Banner */}
              <div className="p-4 rounded-2xl bg-[#0d4652]/40 border border-[#2dd4bf]/30 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2dd4bf] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>Proposed Task Hierarchy</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf]">
                    {totalTaskCount} Total Items
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {proposal.summary}
                </p>
              </div>

              {/* Proposed Tasks & Subtasks Tree List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-[#2dd4bf]" />
                    <span>Parent Tasks ({proposal.tasks.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Click Trash icon to remove unwanted items
                  </span>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {proposal.tasks.map((task, pIdx) => (
                    <div key={pIdx} className="space-y-2">
                      {/* Parent Task Card */}
                      <div className="p-3.5 rounded-2xl bg-[#030d10]/95 border border-[#2dd4bf]/30 shadow-md space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <GitCommit className="w-4 h-4 text-[#2dd4bf] shrink-0" />
                            <h5 className="text-xs sm:text-sm font-bold text-white leading-snug">
                              {pIdx + 1}. {task.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                                PRIORITY_BADGES[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#072229] border border-[#2dd4bf]/30 text-[#2dd4bf]">
                              {task.column}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveParentTask(pIdx)}
                              disabled={step === 'applying'}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Remove Parent Task & Subtasks"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-300 leading-relaxed pl-6">
                            {task.description}
                          </p>
                        )}

                        {task.reasoning && (
                          <p className="text-[11px] text-slate-400 italic pl-6 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#2dd4bf]" />
                            <span>Why: {task.reasoning}</span>
                          </p>
                        )}
                      </div>

                      {/* Subtasks Sub-Tree */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="pl-6 space-y-2 border-l-2 border-[#2dd4bf]/20 ml-3">
                          {task.subtasks.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl bg-[#072229]/80 border border-[#2dd4bf]/15 hover:border-[#2dd4bf]/30 transition-colors space-y-1 relative"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <CornerDownRight className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                                  <span className="text-xs font-semibold text-slate-200">
                                    {sub.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                                      PRIORITY_BADGES[sub.priority]
                                    }`}
                                  >
                                    {sub.priority}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubtask(pIdx, sIdx)}
                                    disabled={step === 'applying'}
                                    className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                                    title="Remove Subtask"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {sub.description && (
                                <p className="text-[11px] text-slate-400 pl-5">
                                  {sub.description}
                                </p>
                              )}

                              {sub.reasoning && (
                                <p className="text-[10px] text-slate-500 italic pl-5">
                                  Reason: {sub.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2dd4bf]/15">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  disabled={step === 'applying'}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Edit Prompt</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={step === 'applying'}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyPlan}
                    disabled={step === 'applying' || proposal.tasks.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(45,212,191,0.3)] disabled:opacity-50"
                  >
                    {step === 'applying' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Tasks &amp; Subtasks in Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Create ({totalTaskCount} Items)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
