'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users,
  UserPlus,
  ShieldAlert,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Crown,
} from 'lucide-react';
import {
  getWorkspaceMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  type WorkspaceMemberDto,
} from '@/actions/workspace';

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  userRole: 'OWNER' | 'MEMBER';
}

export default function WorkspaceMembersModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  userRole,
}: WorkspaceMembersModalProps) {
  const isOwner = userRole === 'OWNER';
  const [mounted, setMounted] = useState(false);

  const [members, setMembers] = useState<WorkspaceMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invite Member Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Action Loading ID
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    let isMounted = true;
    async function loadMembers() {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const res = await getWorkspaceMembers(workspaceId);

      if (!isMounted) return;

      if (!res.success || !res.members) {
        setError(res.message || 'Failed to load workspace members.');
        setMembers([]);
      } else {
        setMembers(res.members);
      }
      setIsLoading(false);
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, workspaceId]);

  if (!isOpen || !mounted) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setError(null);
    setSuccessMessage(null);

    const res = await addWorkspaceMember({
      workspaceId,
      email: inviteEmail.trim(),
    });

    if (!res.success) {
      setError(res.message || 'Failed to add member.');
      setIsInviting(false);
      return;
    }

    setSuccessMessage(res.message || 'Member added successfully.');
    setInviteEmail('');
    setIsInviting(false);

    // Refresh members list
    const updated = await getWorkspaceMembers(workspaceId);
    if (updated.success && updated.members) {
      setMembers(updated.members);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'OWNER' | 'MEMBER') => {
    setActionMemberId(memberId);
    setError(null);
    setSuccessMessage(null);

    const res = await updateWorkspaceMemberRole({
      workspaceId,
      memberId,
      role: newRole,
    });

    if (!res.success) {
      setError(res.message || 'Failed to update role.');
      setActionMemberId(null);
      return;
    }

    setSuccessMessage(res.message || 'Member role updated successfully.');
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setActionMemberId(null);
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from this workspace?`)) return;

    setActionMemberId(memberId);
    setError(null);
    setSuccessMessage(null);

    const res = await removeWorkspaceMember({
      workspaceId,
      memberId,
    });

    if (!res.success) {
      setError(res.message || 'Failed to remove member.');
      setActionMemberId(null);
      return;
    }

    setSuccessMessage('Member removed successfully.');
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setActionMemberId(null);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2dd4bf]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0d4652] text-[#2dd4bf]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Workspace Team
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isOwner
                      ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Your Role: {userRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Workspace: <strong className="text-[#2dd4bf]">{workspaceName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add Member Form (OWNER only) */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-[#030d10]/90 border border-[#2dd4bf]/20 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Invite Team Member by Email
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  disabled={isInviting}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#072229] border border-[#2dd4bf]/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-[0_0_15px_rgba(45,212,191,0.25)] whitespace-nowrap"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 rounded-xl bg-[#030d10]/60 border border-[#2dd4bf]/15 text-xs text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#2dd4bf] shrink-0" />
            <span>You are viewing as a MEMBER. Only workspace Owners can manage team permissions or invite new members.</span>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <span>Members ({members.length})</span>
            <span>Role Permissions</span>
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#2dd4bf] animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#2dd4bf]/20 rounded-xl">
              No members found in this workspace.
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const isMemberOwner = m.role === 'OWNER';
                const isActionBusy = actionMemberId === m.id;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#030d10]/90 border border-[#2dd4bf]/15 hover:border-[#2dd4bf]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0d4652] to-[#07252d] border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] font-bold text-xs">
                        {m.user.name ? m.user.name.charAt(0).toUpperCase() : m.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {m.user.name || m.user.email.split('@')[0]}
                          </span>
                          {isMemberOwner && <Crown className="w-3 h-3 text-[#fbbf24]" />}
                        </div>
                        <span className="text-[11px] text-slate-400">{m.user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <>
                          <select
                            value={m.role}
                            disabled={isActionBusy}
                            onChange={(e) =>
                              handleUpdateRole(m.id, e.target.value as 'OWNER' | 'MEMBER')
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#072229] border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf] focus:outline-none disabled:opacity-50"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>

                          <button
                            onClick={() => handleRemoveMember(m.id, m.user.email)}
                            disabled={isActionBusy}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                            title="Remove Member"
                          >
                            {isActionBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                            isMemberOwner
                              ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#2dd4bf]/15">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
