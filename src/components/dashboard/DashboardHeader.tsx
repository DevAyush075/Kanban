'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Kanban as KanbanIcon,
  Search,
  Bell,
  Plus,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LayoutGrid,
  CheckCircle2,
  Users,
  Building,
  FolderPlus,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getUserWorkspaces,
  createWorkspace,
  type WorkspaceDto,
} from '@/actions/workspace';
import WorkspaceMembersModal from './WorkspaceMembersModal';
import { signOut } from 'next-auth/react';

interface DashboardHeaderProps {
  onNewBoardClick?: () => void;
  onAiPromptClick?: () => void;
  workspaces?: WorkspaceDto[];
  activeWorkspaceId?: string;
  onSelectWorkspace?: (id: string) => void;
  onWorkspaceCreated?: (newWorkspace: WorkspaceDto) => void;
}

export default function DashboardHeader({
  onNewBoardClick,
  onAiPromptClick,
  workspaces: initialWorkspaces,
  activeWorkspaceId: propActiveWsId,
  onSelectWorkspace,
  onWorkspaceCreated,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Create Workspace Modal State
  const [showCreateWsModal, setShowCreateWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [createWsError, setCreateWsError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>(initialWorkspaces || []);
  const [selectedWsId, setSelectedWsId] = useState<string | undefined>(propActiveWsId);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialWorkspaces && initialWorkspaces.length > 0) {
      setWorkspaces(initialWorkspaces);
      if (!selectedWsId) setSelectedWsId(propActiveWsId || initialWorkspaces[0].id);
      return;
    }

    let isMounted = true;
    async function loadWorkspaces() {
      const res = await getUserWorkspaces();
      if (!isMounted) return;
      if (res.success && res.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        setSelectedWsId(res.workspaces[0].id);
      }
    }
    loadWorkspaces();
    return () => {
      isMounted = false;
    };
  }, [initialWorkspaces, propActiveWsId]);

  const activeWorkspace = workspaces.find((w) => w.id === selectedWsId) || workspaces[0];

  const handleSelectWs = (id: string) => {
    setSelectedWsId(id);
    setShowWorkspaceMenu(false);
    if (onSelectWorkspace) onSelectWorkspace(id);
  };

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWsName.trim();
    if (!trimmed) return;

    setIsCreatingWs(true);
    setCreateWsError(null);

    const res = await createWorkspace({ name: trimmed });

    if (!res.success || !res.workspace) {
      setCreateWsError(res.message || 'Failed to create workspace.');
      setIsCreatingWs(false);
      return;
    }

    const createdWs: WorkspaceDto = {
      id: res.workspace.id,
      name: res.workspace.name,
      createdAt: res.workspace.createdAt,
      role: 'OWNER',
    };

    const updatedList = [createdWs, ...workspaces];
    setWorkspaces(updatedList);
    setSelectedWsId(createdWs.id);
    setNewWsName('');
    setIsCreatingWs(false);
    setShowCreateWsModal(false);

    if (onSelectWorkspace) onSelectWorkspace(createdWs.id);
    if (onWorkspaceCreated) onWorkspaceCreated(createdWs);
  };

  const notifications = [
    { id: '1', title: 'AI Mascot generated 6 subtasks', time: '10m ago', unread: true },
    { id: '2', title: 'Maya moved "OAuth Login" to Done', time: '1h ago', unread: true },
    { id: '3', title: 'Sprint retrospective scheduled', time: '3h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030a0d]/90 backdrop-blur-xl border-b border-[#2dd4bf]/15 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Section: Brand Logo & Workspace Switcher */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#07252d]/90 backdrop-blur-md border border-[#2dd4bf]/30 px-4 py-1.5 rounded-full shadow-lg text-lg font-bold tracking-tight text-white font-['Space_Grotesk'] hover:border-[#2dd4bf]/60 transition-all"
          >
            <div className="p-1 rounded-lg bg-[#0d4652] text-[#2dd4bf]">
              <KanbanIcon className="w-4 h-4" />
            </div>
            <span>kanman<span className="text-[#2dd4bf]">.ai</span></span>
          </Link>

          {/* Workspace Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setShowWorkspaceMenu(!showWorkspaceMenu);
                setShowProfileMenu(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#072229]/80 border border-[#2dd4bf]/20 text-xs font-semibold text-slate-300 hover:border-[#2dd4bf]/40 cursor-pointer transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
              <span className="max-w-[140px] truncate">
                {activeWorkspace ? activeWorkspace.name : 'Workspace'}
              </span>
              {activeWorkspace?.role && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                    activeWorkspace.role === 'OWNER'
                      ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {activeWorkspace.role}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Workspace Dropdown Menu */}
            {showWorkspaceMenu && (
              <div className="absolute left-0 mt-2 w-64 p-2 rounded-2xl bg-[#07252d] border border-[#2dd4bf]/30 shadow-2xl z-50 animate-in fade-in duration-150 space-y-1">
                <div className="px-3 py-1.5 border-b border-[#2dd4bf]/15 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Workspaces</span>
                  <button
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      setShowCreateWsModal(true);
                    }}
                    className="text-[#2dd4bf] hover:underline text-[10px] font-bold flex items-center gap-1"
                  >
                    <FolderPlus className="w-3 h-3" />
                    <span>+ New</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleSelectWs(ws.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        ws.id === selectedWsId
                          ? 'bg-[#0d4652]/70 text-[#2dd4bf] font-bold'
                          : 'text-slate-300 hover:bg-[#072229]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase bg-slate-900 border-slate-700 text-slate-400">
                        {ws.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-[#2dd4bf]/15 space-y-1">
                  <button
                    onClick={() => {
                      setShowWorkspaceMenu(false);
                      setShowCreateWsModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#fbbf24] hover:bg-[#fbbf24]/10 font-semibold transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create New Workspace</span>
                  </button>

                  {activeWorkspace && (
                    <button
                      onClick={() => {
                        setShowWorkspaceMenu(false);
                        setShowTeamModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#2dd4bf] hover:bg-[#0d4652]/40 font-semibold transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage Workspace Team</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards, tasks, or AI logs... (Ctrl+K)"
              className="w-full pl-10 pr-12 py-2 rounded-xl bg-[#071f25]/80 border border-[#2dd4bf]/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#072229] border border-[#2dd4bf]/30 text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Quick Actions, Team, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Team Members Button */}
          {activeWorkspace && (
            <button
              onClick={() => setShowTeamModal(true)}
              className="p-2 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-300 hover:text-white hover:border-[#2dd4bf]/40 transition-colors"
              title="Workspace Team & Members"
            >
              <Users className="w-4 h-4 text-[#2dd4bf]" />
            </button>
          )}

          {/* AI Companion Quick Trigger */}
          <button
            onClick={onAiPromptClick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0d4652] to-[#07252d] border border-[#2dd4bf]/40 text-xs font-semibold text-[#2dd4bf] hover:text-white hover:border-[#2dd4bf] transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] animate-pulse" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>

          {/* New Board Button */}
          <button
            onClick={onNewBoardClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#030a0d] bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#ffd700] transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Board</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowWorkspaceMenu(false);
              }}
              className="p-2 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-300 hover:text-white hover:border-[#2dd4bf]/40 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fbbf24] animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fbbf24]" />
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-4 rounded-2xl bg-[#07252d] border border-[#2dd4bf]/30 shadow-2xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2dd4bf]/15">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] font-semibold">
                    3 New
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/10 hover:border-[#2dd4bf]/30 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-medium text-slate-200">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowWorkspaceMenu(false);
              }}
              className="flex items-center gap-2 p-1 rounded-full bg-[#07252d] border border-[#2dd4bf]/30 hover:border-[#2dd4bf]/60 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#fbbf24] flex items-center justify-center text-[#030a0d] font-bold text-xs">
                A
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pr-1 hidden sm:block" />
            </button>

            {/* Profile Menu Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#07252d] border border-[#2dd4bf]/30 shadow-2xl z-50 animate-in fade-in duration-150 space-y-1">
                <div className="px-3 py-2 border-b border-[#2dd4bf]/15 mb-1">
                  <p className="text-xs font-bold text-white">Workspace Account</p>
                  <p className="text-[11px] text-slate-400 truncate">Role: {activeWorkspace?.role || 'MEMBER'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowTeamModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#0d4652]/40 transition-colors"
                >
                  <Users className="w-4 h-4 text-[#2dd4bf]" />
                  <span>Manage Team</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowCreateWsModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#0d4652]/40 transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-[#fbbf24]" />
                  <span>New Workspace</span>
                </button>
                <div className="pt-1 border-t border-[#2dd4bf]/15 mt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Workspace Members Modal */}
      {activeWorkspace && (
        <WorkspaceMembersModal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          userRole={activeWorkspace.role}
        />
      )}

      {/* Create Workspace Modal */}
      {showCreateWsModal && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2dd4bf]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#0d4652] text-[#fbbf24]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Create New Workspace
                  </h3>
                  <p className="text-xs text-slate-400">You will be assigned as OWNER</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateWsModal(false)}
                disabled={isCreatingWs}
                className="p-1.5 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createWsError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{createWsError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Workspace Name <span className="text-[#2dd4bf]">*</span>
                </label>
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => {
                    setNewWsName(e.target.value);
                    if (createWsError) setCreateWsError(null);
                  }}
                  placeholder="e.g. Engineering Team or Marketing Sprints"
                  required
                  disabled={isCreatingWs}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2dd4bf]/15">
                <button
                  type="button"
                  onClick={() => setShowCreateWsModal(false)}
                  disabled={isCreatingWs}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWs || !newWsName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_15px_rgba(45,212,191,0.25)]"
                >
                  {isCreatingWs ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Workspace</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
