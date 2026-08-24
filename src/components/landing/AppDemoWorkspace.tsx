'use client';

import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Bot,
  User,
  Send,
  Sparkles,
  MousePointer2,
  CheckCircle2,
  Clock,
  Code2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export default function AppDemoWorkspace() {
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Plan the SignalChain project with full CI/CD pipeline, backend API, and database setup.',
      time: '10:42 AM'
    },
    {
      id: 2,
      sender: 'ai',
      text: 'Created a SignalChain board with 8 tasks across Backlog, Ready, and Development.',
      time: '10:42 AM'
    },
    {
      id: 3,
      sender: 'ai',
      text: "I'm working on the CI/CD pipeline right now. Moving task into Development.",
      time: '10:43 AM'
    }
  ]);

  const [newPrompt, setNewPrompt] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: newPrompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setNewPrompt('');
    setIsAiTyping(true);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Understood! Added task "${newPrompt.slice(0, 30)}..." to your Kanban board and updated priorities.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiTyping(false);
    }, 1200);
  };

  return (
    <section id="app-demo-workspace" className="relative py-12 lg:py-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030a0d] via-[#05161c] to-[#030a0d] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[500px] bg-[#06b6d4]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#072229] border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf]">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Interactive Demo Workspace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            See <span className="text-[#fbbf24]">kanman.ai</span> in live action
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Watch how the AI agent reads conversation intent, updates task states, and moves Kanban cards in real-time.
          </p>

          {/* Animation Toggle Bar */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#072229] border border-[#2dd4bf]/30 text-xs font-medium text-slate-200 hover:text-white hover:border-[#2dd4bf] transition-all"
            >
              {isPlayingAnimation ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>Replay Drag Animation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span>Play Animation Overlay</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" />
              Live Simulation Active
            </span>
          </div>
        </div>

        {/* Main App Glass Window Frame (`app.kanman.ai`) */}
        <div className="relative rounded-2xl border border-[#2dd4bf]/25 bg-[#040e11]/90 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Top Browser Bar */}
          <div className="px-4 py-3 bg-[#071c22] border-b border-[#2dd4bf]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 rounded-md bg-[#030a0d]/80 border border-slate-800 text-xs text-slate-300 font-mono">
                <span className="text-emerald-400">https://</span>
                <span className="text-white font-semibold">app.kanman.ai</span>
                <span className="text-slate-500">/workspace/signal-chain</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d4652]/40 border border-[#2dd4bf]/30 text-[11px] text-[#2dd4bf] font-medium">
                <Zap className="w-3 h-3 text-[#fbbf24]" />
                <span>AI Syncing</span>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* App Split Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px] relative">

            {/* Left Section: The Kanban Board (Cols 1 to 7) */}
            <div className="lg:col-span-7 p-4 sm:p-5 border-r border-[#2dd4bf]/15 bg-[#030d10]/60 relative overflow-x-auto">
              
              {/* Board Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Kanban className="w-5 h-5 text-[#2dd4bf]" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    SignalChain Sprint Board
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/30 font-mono">
                    8 Tasks
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Memory State: <span className="text-[#fbbf24] font-medium">Structured</span>
                </div>
              </div>

              {/* Kanban Columns Grid */}
              <div className="grid grid-cols-5 gap-2.5 min-w-[650px] relative">

                {/* Column 1: BACKLOG */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#072229]/80 border border-slate-800 text-[11px] font-bold text-slate-300 uppercase">
                    <span>Backlog</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">2</span>
                  </div>

                  {/* Card 1 */}
                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 hover:border-[#2dd4bf]/40 transition-all text-xs space-y-2 group shadow-sm">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                      API
                    </span>
                    <p className="font-medium text-slate-200 group-hover:text-white">
                      Build registration API
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2d</span>
                      <div className="w-4 h-4 rounded-full bg-[#06b6d4]/30 text-[9px] font-bold text-[#2dd4bf] flex items-center justify-center">AI</div>
                    </div>
                  </div>

                  {/* Card 2: Animated Card ("Set up CI/CD pipeline") */}
                  <div className={`relative ${isPlayingAnimation ? 'animate-card-drag z-30' : ''}`}>
                    <div className="p-2.5 rounded-lg bg-[#08262f] border border-[#2dd4bf]/50 text-xs space-y-2 shadow-lg shadow-[#06b6d4]/20 relative">
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                          DevOps
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping" />
                      </div>
                      <p className="font-bold text-white">
                        Set up CI/CD pipeline
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-[#2dd4bf]/20">
                        <span className="flex items-center gap-1 text-[#2dd4bf]"><Code2 className="w-3 h-3" /> GitHub Actions</span>
                        <div className="w-4 h-4 rounded-full bg-[#fbbf24] text-[9px] font-bold text-[#030a0d] flex items-center justify-center">K</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: READY */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#072229]/80 border border-slate-800 text-[11px] font-bold text-slate-300 uppercase">
                    <span>Ready</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">2</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 hover:border-[#2dd4bf]/40 transition-all text-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Database
                    </span>
                    <p className="font-medium text-slate-200">
                      Configure database schema
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>PostgreSQL</span>
                      <span className="text-slate-400">P1</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 hover:border-[#2dd4bf]/40 transition-all text-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800">
                      Billing
                    </span>
                    <p className="font-medium text-slate-200">
                      Integrate Stripe webhooks
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Stripe v3</span>
                      <span className="text-slate-400">P2</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: DEVELOPMENT (Target animated column) */}
                <div className={`space-y-2.5 p-1 rounded-xl transition-all ${isPlayingAnimation ? 'animate-target-column bg-[#07252d]/40' : ''}`}>
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#0d4652]/70 border border-[#2dd4bf]/30 text-[11px] font-bold text-[#2dd4bf] uppercase">
                    <span>Development</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#06b6d4]/20 text-[#2dd4bf] text-[10px] font-mono">2</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 text-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-950 text-violet-400 border border-violet-800">
                      Auth
                    </span>
                    <p className="font-medium text-slate-200">
                      Implement OAuth 2.0
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>NextAuth</span>
                      <span className="text-[#2dd4bf]">Active</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 text-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#0d4652] text-[#2dd4bf] border border-[#2dd4bf]/30">
                      UI System
                    </span>
                    <p className="font-medium text-slate-200">
                      Design UI System
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Tailwind/CSS</span>
                      <span className="text-amber-400">In Progress</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: CODE REVIEW */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#072229]/80 border border-slate-800 text-[11px] font-bold text-slate-300 uppercase">
                    <span>Review</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">1</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071c22] border border-slate-800 text-xs space-y-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                      Prisma
                    </span>
                    <p className="font-medium text-slate-200">
                      Refactor Prisma client
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>PR #14</span>
                      <span className="text-purple-400">Review</span>
                    </div>
                  </div>
                </div>

                {/* Column 5: DONE */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#072229]/80 border border-slate-800 text-[11px] font-bold text-slate-300 uppercase">
                    <span>Done</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px]">2</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#05181e] border border-emerald-900/40 text-xs space-y-2 opacity-80">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                    <p className="font-medium text-slate-300 line-through">
                      Setup Next.js App Router
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#05181e] border border-emerald-900/40 text-xs space-y-2 opacity-80">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                    <p className="font-medium text-slate-300 line-through">
                      Deploy to Vercel
                    </p>
                  </div>
                </div>

              </div>

              {/* Dynamic Animated Cursor Badge Overlay */}
              {isPlayingAnimation && (
                <div className="absolute animate-cursor-drag pointer-events-none z-50">
                  <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fbbf24] text-[#030a0d] font-bold text-[11px] shadow-[0_0_20px_rgba(251,191,36,0.8)] border border-white">
                    <MousePointer2 className="w-3.5 h-3.5 fill-[#030a0d]" />
                    <span>kanman</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section: The AI Chat Interface (Cols 8 to 12) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 bg-[#041216] relative">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#06b6d4] to-[#fbbf24] flex items-center justify-center text-[#030a0d] font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      kanman Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-slate-400">Kanban Memory Thread</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#2dd4bf] px-2 py-0.5 rounded bg-[#072229]">
                  Model: GPT-4o
                </span>
              </div>

              {/* Message Conversation Stream */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      {msg.sender === 'user' ? (
                        <>
                          <span>You</span>
                          <User className="w-3 h-3 text-slate-400" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-[#2dd4bf]" />
                          <span className="text-[#2dd4bf] font-medium">kanman AI</span>
                        </>
                      )}
                      <span>• {msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[90%] p-3 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0d4652] text-white border border-[#2dd4bf]/40 rounded-tr-none'
                          : 'bg-[#082026] text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#082026] border border-slate-800 w-fit">
                    <Bot className="w-3.5 h-3.5 text-[#2dd4bf] animate-bounce" />
                    <span className="text-xs text-slate-400">kanman is updating board...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-slate-800">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Type instruction (e.g. 'Assign CI/CD to Alex')..."
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#030a0d] border border-slate-800 text-white text-xs focus:outline-none focus:border-[#2dd4bf] transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1.5 rounded-lg bg-[#2dd4bf] text-[#030a0d] hover:bg-[#fbbf24] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
