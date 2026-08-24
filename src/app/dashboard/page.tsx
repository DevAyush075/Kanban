'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Kanban as KanbanIcon,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Star,
  Search,
  ArrowRight,
  Bot,
  Zap,
  FolderPlus,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  MoreVertical,
  Play,
  Loader2,
  Check,
  Calendar,
  ChevronRight,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import RobotMascot3D from '@/components/landing/RobotMascot3D';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  getUserBoards,
  createBoard,
  type BoardDto,
} from '@/actions/board';
import {
  getUserWorkspaces,
  createWorkspace,
  type WorkspaceDto,
} from '@/actions/workspace';

type BoardItem = BoardDto;

export default function DashboardHomePage() {
  const router = useRouter();

  // State for AI Prompt & Board Creation Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [createBoardError, setCreateBoardError] = useState<string | null>(null);

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'all' | 'starred' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Workspaces State
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  // Real Database Boards State & Loading/Error States
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [isLoadingBoards, setIsLoadingBoards] = useState<boolean>(true);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  // Fetch real boards and workspaces from Prisma via Server Actions
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingBoards(true);
      setBoardsError(null);

      const [boardsRes, workspacesRes] = await Promise.all([
        getUserBoards(),
        getUserWorkspaces(),
      ]);

      if (!isMounted) return;

      if (workspacesRes.success && workspacesRes.workspaces && workspacesRes.workspaces.length > 0) {
        setWorkspaces(workspacesRes.workspaces);
        setActiveWorkspaceId(workspacesRes.workspaces[0].id);
      }

      if (!boardsRes.success) {
        setBoardsError(boardsRes.message || 'Unable to fetch workspace boards.');
        setBoards([]);
        if (boardsRes.message?.toLowerCase().includes('unauthorized') || boardsRes.message?.toLowerCase().includes('sign in')) {
          router.push('/login');
          return;
        }
      } else {
        setBoards(boardsRes.boards || []);
      }
      setIsLoadingBoards(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Priority Tasks State
  const [tasks, setTasks] = useState([
    { id: 't-1', title: 'Implement OAuth2 PKCE Auth Flow', board: 'AI Engine v2.0', priority: 'HIGH', done: false },
    { id: 't-2', title: 'Optimize Three.js WebGL Mascot levitation', board: 'Mobile App Redesign', priority: 'URGENT', done: false },
    { id: 't-3', title: 'Write unit tests for Prisma Server Actions', board: 'Customer Portal API', priority: 'MEDIUM', done: true },
  ]);

  // Toggle Starred Board
  const toggleStar = (id: string) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, starred: !b.starred } : b))
    );
  };

  // Toggle Task Completion
  const toggleTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // AI Generation Handler
  const handleGenerateAiBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;

    setIsGeneratingAi(true);
    setTimeout(() => {
      const generatedBoard: BoardItem = {
        id: `board-${Date.now()}`,
        name: aiPrompt.length > 30 ? aiPrompt.substring(0, 30) + '...' : aiPrompt,
        category: 'AI Generated Sprint',
        taskCount: 8,
        completedTasks: 0,
        starred: true,
        color: 'from-[#2dd4bf] via-[#38bdf8] to-[#fbbf24]',
        updatedAt: 'Just now',
        createdAt: new Date().toISOString(),
        workspaceId: activeWorkspaceId || 'workspace-temp',
        members: ['A', 'AI'],
      };
      setBoards([generatedBoard, ...boards]);
      setIsGeneratingAi(false);
      setShowAiModal(false);
      setAiPrompt('');
    }, 1800);
  };

  // Real Database Board Creation Handler (Phase 2)
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newBoardName.trim();
    if (!trimmedName) return;

    if (!activeWorkspaceId) {
      setCreateBoardError('No active workspace available to create board.');
      return;
    }

    setIsCreatingBoard(true);
    setCreateBoardError(null);

    const res = await createBoard({
      name: trimmedName,
      workspaceId: activeWorkspaceId,
    });

    if (!res.success) {
      setCreateBoardError(res.message || 'Failed to create board.');
      setIsCreatingBoard(false);
      return;
    }

    // Refresh boards from Neon PostgreSQL database
    const updatedRes = await getUserBoards();
    if (updatedRes.success && updatedRes.boards) {
      setBoards(updatedRes.boards);
    }

    setIsCreatingBoard(false);
    setShowNewBoardModal(false);
    setNewBoardName('');
    setCreateBoardError(null);
  };

  // Filtered boards list
  const filteredBoards = boards.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'starred') return matchesSearch && b.starred;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24] relative">
      
      {/* Top Navbar */}
      <DashboardHeader
        onNewBoardClick={() => setShowNewBoardModal(true)}
        onAiPromptClick={() => setShowAiModal(true)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId || undefined}
        onSelectWorkspace={(id) => setActiveWorkspaceId(id)}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* 1. Hero Welcome & AI Prompt Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#07252d]/90 via-[#072229]/80 to-[#030d10]/95 backdrop-blur-2xl border border-[#2dd4bf]/30 shadow-[0_0_50px_rgba(7,34,41,0.6)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Welcome Text & AI Search Prompt */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d4652]/60 border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf]">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] animate-pulse" />
                <span>AI Mascot Assistant Active</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
                Welcome back! 👋
              </h1>
              
              <p className="text-slate-400 text-sm max-w-xl">
                You have <strong className="text-white">{boards.length} active {boards.length === 1 ? 'board' : 'boards'}</strong> scheduled today. Ask AI to auto-generate a new sprint board below.
              </p>

              {/* Instant AI Prompt Generator Bar */}
              <form onSubmit={handleGenerateAiBoard} className="pt-2">
                <div className="relative flex items-center max-w-xl">
                  <Bot className="absolute left-3.5 w-5 h-5 text-[#2dd4bf]" />
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. 'Build an e-commerce checkout flow with Next.js & Stripe'..."
                    className="w-full pl-11 pr-32 py-3 rounded-2xl bg-[#030d10]/90 border border-[#2dd4bf]/30 focus:border-[#2dd4bf] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] shadow-inner transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingAi || !aiPrompt}
                    className="absolute right-2 px-4 py-2 rounded-xl font-bold text-xs text-[#030a0d] bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#ffd700] transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>AI Generate</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Suggested Template Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Try prompt:</span>
                  {[
                    'Sprint Planning',
                    'Bug Triage Board',
                    'Feature Specs Roadmap',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(`Generate a ${chip} board`)}
                      className="px-2.5 py-1 rounded-lg bg-[#072229] border border-[#2dd4bf]/20 text-[11px] font-medium text-slate-300 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/40 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Right Side 3D Mascot Preview */}
            <div className="lg:col-span-4 hidden lg:block relative h-48 w-full">
              <div className="absolute inset-0 rounded-2xl bg-[#030d10]/40 border border-[#2dd4bf]/15 flex items-center justify-center overflow-hidden">
                <RobotMascot3D className="w-full h-full" />
              </div>
            </div>

          </div>
        </div>

        {/* 2. Your Workspaces Hub Section */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#07252d]/60 backdrop-blur-xl border border-[#2dd4bf]/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#2dd4bf]/15">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Your Workspaces ({workspaces.length})
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/30">
                  Real Database
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Switch workspaces to view associated boards or invite team members
              </p>
            </div>

            <button
              onClick={() => {
                const headerNewBtn = document.querySelector('header');
                if (headerNewBtn) {
                  headerNewBtn.scrollIntoView({ behavior: 'smooth' });
                }
                const evt = new CustomEvent('openCreateWsModal');
                window.dispatchEvent(evt);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] text-[#030a0d] text-xs font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Create Workspace</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <div
                  key={ws.id}
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#0d4652]/80 border-[#2dd4bf] ring-1 ring-[#2dd4bf]/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]'
                      : 'bg-[#030d10]/80 border-[#2dd4bf]/20 hover:border-[#2dd4bf]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`p-2 rounded-xl border ${isActive ? 'bg-[#2dd4bf] text-[#030a0d]' : 'bg-[#072229] text-[#2dd4bf] border-[#2dd4bf]/20'}`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{ws.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        Role: <span className="text-[#2dd4bf] font-semibold">{ws.role}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      isActive
                        ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Select'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Workspace Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Active Boards',
              value: isLoadingBoards ? '...' : `${boards.length} ${boards.length === 1 ? 'Board' : 'Boards'}`,
              trend: 'Database verified',
              icon: KanbanIcon,
              color: 'text-[#2dd4bf]',
              bg: 'bg-[#2dd4bf]/10 border-[#2dd4bf]/20',
            },
            {
              title: 'Task Completion Rate',
              value: '0%',
              trend: 'Phase 1 initialized',
              icon: CheckCircle2,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
            {
              title: 'AI Logs Logged',
              value: '0 Logs',
              trend: '⚡ System standby',
              icon: Sparkles,
              color: 'text-[#fbbf24]',
              bg: 'bg-[#fbbf24]/10 border-[#fbbf24]/20',
            },
            {
              title: 'Workspace Access',
              value: 'Authenticated',
              trend: 'Session secured',
              icon: Users,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#07252d]/60 backdrop-blur-md border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-['Space_Grotesk']">{stat.value}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#2dd4bf]" />
                <span>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Main Workspace Grid: Boards on Left, Activity/Tasks on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Kanban Boards List & Filters */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Kanban Boards ({filteredBoards.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Select a board to launch interactive drag-and-drop workspace
                </p>
              </div>

              {/* Tabs & Search */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-[#072229] border border-[#2dd4bf]/20">
                  {(['all', 'starred'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-[#0d4652] text-[#2dd4bf] shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowNewBoardModal(true)}
                  className="p-2 rounded-xl bg-[#072229] border border-[#2dd4bf]/20 text-[#2dd4bf] hover:bg-[#0d4652]/60 transition-colors"
                  title="Create Board"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Alert Display */}
            {boardsError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{boardsError}</span>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoadingBoards && (
              <div className="p-12 rounded-2xl bg-[#07252d]/40 border border-[#2dd4bf]/20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#2dd4bf]" />
                <p className="text-xs text-slate-400">Loading workspace boards from database...</p>
              </div>
            )}

            {/* Boards Card Grid */}
            {!isLoadingBoards && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* "+ Create Board" Blank Action Card */}
                <div
                  onClick={() => setShowNewBoardModal(true)}
                  className="p-6 rounded-2xl bg-[#07252d]/40 border-2 border-dashed border-[#2dd4bf]/30 hover:border-[#2dd4bf]/70 hover:bg-[#07252d]/80 cursor-pointer transition-all flex flex-col items-center justify-center text-center group min-h-[190px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#072229] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] group-hover:scale-110 group-hover:bg-[#0d4652] transition-all mb-3 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">Create New Board</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                    Start from scratch or use AI auto-generator
                  </p>
                </div>

                {/* Empty State when no boards exist */}
                {filteredBoards.length === 0 && !boardsError && (
                  <div className="p-6 rounded-2xl bg-[#07252d]/40 border-2 border-dashed border-[#2dd4bf]/30 flex flex-col items-center justify-center text-center space-y-3 min-h-[190px]">
                    <div className="w-10 h-10 rounded-2xl bg-[#072229] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf]">
                      <KanbanIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">No boards yet</h3>
                      <p className="text-xs text-slate-400 max-w-[220px]">
                        Create your first board to start managing your project.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNewBoardModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Board</span>
                    </button>
                  </div>
                )}

                {/* Existing Database Boards Cards */}
                {filteredBoards.map((board) => {
                  const progressPct = Math.round((board.completedTasks / board.taskCount) * 100) || 0;
                  return (
                    <div
                      key={board.id}
                      onClick={() => router.push(`/boards/${board.id}`)}
                      className="group relative p-5 rounded-2xl bg-[#07252d]/80 backdrop-blur-md border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/60 cursor-pointer transition-all shadow-lg hover:shadow-[0_0_30px_rgba(7,34,41,0.9)] flex flex-col justify-between"
                    >
                      {/* Top Tag & Star */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0d4652]/70 text-[#2dd4bf] border border-[#2dd4bf]/20">
                          {board.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(board.id);
                          }}
                          className="p-1 text-slate-400 hover:text-[#fbbf24] transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              board.starred ? 'text-[#fbbf24] fill-[#fbbf24]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Board Title */}
                      <div className="space-y-1 mb-4">
                        <h3 className="text-base font-bold text-white font-['Space_Grotesk'] group-hover:text-[#2dd4bf] transition-colors">
                          {board.name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Updated {board.updatedAt}</span>
                        </p>
                      </div>

                      {/* Progress Bar & Stats */}
                      <div className="space-y-2 pt-2 border-t border-[#2dd4bf]/10">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                          <span>{board.completedTasks}/{board.taskCount} Tasks Complete</span>
                          <span className="text-slate-200 font-bold">{progressPct}%</span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[#030d10] overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${board.color} transition-all duration-500`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-2">
                          {/* Member Avatars */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {board.members.map((m, idx) => (
                              <div
                                key={idx}
                                className="w-5 h-5 rounded-full bg-[#0d4652] border border-[#030a0d] text-[9px] font-bold text-[#2dd4bf] flex items-center justify-center"
                              >
                                {m}
                              </div>
                            ))}
                          </div>

                          {/* Open Board Action Link */}
                          <Link
                            href={`/boards/${board.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#2dd4bf] hover:text-[#5eead4] group-hover:translate-x-0.5 transition-all"
                          >
                            <span>Open Board</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </div>

          {/* Right Column (4 cols): Priority Tasks & Live Activity Timeline */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Priority Tasks List Widget */}
            <div className="p-5 rounded-2xl bg-[#07252d]/80 backdrop-blur-md border border-[#2dd4bf]/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2dd4bf]/15">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#fbbf24]" />
                  <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">My High Priority Tasks</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24]">
                  {tasks.filter(t => !t.done).length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskDone(task.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      task.done
                        ? 'bg-[#030d10]/40 border-slate-800 opacity-60'
                        : 'bg-[#030d10]/90 border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-colors ${
                        task.done
                          ? 'bg-[#2dd4bf] text-[#030a0d]'
                          : 'border border-slate-500 hover:border-[#2dd4bf]'
                      }`}
                    >
                      {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <p className={`text-xs font-semibold ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{task.board}</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300' : 'bg-[#fbbf24]/20 text-[#fbbf24]'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Stream Widget */}
            <div className="p-5 rounded-2xl bg-[#07252d]/80 backdrop-blur-md border border-[#2dd4bf]/30 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2dd4bf]/15">
                <BarChart3 className="w-4 h-4 text-[#2dd4bf]" />
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">Recent Activity Stream</h3>
              </div>

              <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2dd4bf]/15">
                {[
                  { user: 'AI Mascot', action: 'Generated 5 subtasks for OAuth Architecture', time: '10m ago', icon: Bot, color: 'text-[#2dd4bf]' },
                  { user: 'Maya Lin', action: 'Moved "API Endpoints" to Completed', time: '1h ago', icon: CheckCircle2, color: 'text-emerald-400' },
                  { user: 'Alex', action: 'Created new board "Mobile App Redesign"', time: '2h ago', icon: Plus, color: 'text-[#fbbf24]' },
                ].map((act, idx) => (
                  <div key={idx} className="relative pl-6 space-y-0.5 text-xs">
                    <div className={`absolute left-0 top-0.5 w-4 h-4 rounded-full bg-[#072229] border border-[#2dd4bf]/40 flex items-center justify-center ${act.color}`}>
                      <act.icon className="w-2.5 h-2.5" />
                    </div>
                    <p className="text-slate-300 font-medium">
                      <strong className="text-white">{act.user}</strong> {act.action}
                    </p>
                    <span className="text-[10px] text-slate-500 block">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* AI Board Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#0d4652] text-[#2dd4bf] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">AI Board Generator</h3>
                <p className="text-xs text-slate-400">Describe your project and AI will generate columns &amp; tasks</p>
              </div>
            </div>

            <form onSubmit={handleGenerateAiBoard} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Project Prompt
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create a sprint board for launching a React Native mobile application with user authentication, push notifications, and payment processing..."
                  rows={4}
                  required
                  className="w-full p-3.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiPrompt}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] text-[#030a0d] text-xs font-bold hover:from-[#f59e0b] hover:to-[#ffd700] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)] disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#030a0d]" />
                      <span>Generating Sprint...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Generate Board</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual New Board Modal */}
      {showNewBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#0d4652] text-[#2dd4bf] flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-[#2dd4bf]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Create Kanban Board</h3>
                <p className="text-xs text-slate-400">Set up a new board for your team</p>
              </div>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4 pt-2">
              {createBoardError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{createBoardError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => {
                    setNewBoardName(e.target.value);
                    if (createBoardError) setCreateBoardError(null);
                  }}
                  placeholder="e.g. Design System v3.0"
                  required
                  disabled={isCreatingBoard}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBoardModal(false);
                    setCreateBoardError(null);
                  }}
                  disabled={isCreatingBoard}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBoard || !newBoardName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingBoard ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Board</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-5 border-t border-[#2dd4bf]/10 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} kanman.ai. All rights reserved.</p>
      </footer>

    </div>
  );
}
