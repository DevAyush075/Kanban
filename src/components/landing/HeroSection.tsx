'use client';

import React, { useState } from 'react';
import RobotMascot3D from './RobotMascot3D';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface HeroSectionProps {
  onStartConversation?: (promptText: string) => void;
  isAiWorking?: boolean;
}

export default function HeroSection({ onStartConversation, isAiWorking = false }: HeroSectionProps) {
  const [promptInput, setPromptInput] = useState('Plan the SignalChain project...');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onStartConversation && promptInput.trim()) {
      onStartConversation(promptInput);
      const appDemoElement = document.getElementById('app-demo-workspace');
      if (appDemoElement) {
        appDemoElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="home" className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
      {/* Background Ambient Teal & Blue Gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-[#073642] via-[#094d5d] to-[#041a21] rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (7 Cols): Headline with Yellow Paint Stroke + Description + CTA Card */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            
            {/* Headline Container with Yellow Paint Brush Highlight & Paint Drips */}
            <div className="relative inline-block">
              {/* Yellow Paint Stroke Background Badge */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-[#eab308] shadow-[0_0_50px_rgba(234,179,8,0.4)] text-[#030a0d] border border-[#fef08a]/60 transform -rotate-1">
                
                {/* Paint drips at the bottom */}
                <div className="absolute -bottom-5 left-10 w-3 h-7 bg-[#eab308] rounded-b-full shadow-md" />
                <div className="absolute -bottom-7 left-32 w-3.5 h-9 bg-[#eab308] rounded-b-full shadow-md" />
                <div className="absolute -bottom-4 left-64 w-2.5 h-6 bg-[#eab308] rounded-b-full shadow-md" />

                {/* Main Headline text in bold black display */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-['Space_Grotesk'] leading-[1.1] text-[#030a0d]">
                  World's first <br />
                  AI that thinks <br />
                  in kanban.
                </h1>
              </div>
            </div>

            {/* Sub-headline & Description Paragraph */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-xl">
              The first project management AI that thinks in kanban. Describe your goals in plain language.{' '}
              <strong className="text-white font-semibold">kanman</strong> organizes, delegates, and delivers — using kanban boards as structured memory you can see, touch, and shape.
            </p>

            {/* Primary CTA Card */}
            <div className="relative group max-w-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#06b6d4] via-[#2dd4bf] to-[#fbbf24] rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
              
              <div className="relative p-5 sm:p-6 rounded-2xl bg-[#05181e]/95 border border-[#2dd4bf]/30 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                    Start a conversation
                  </label>
                  <span className="text-[11px] text-slate-400">Prompt Assistant</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="e.g. Build registration API & set up CI/CD..."
                      className="w-full px-4 py-3.5 rounded-xl bg-[#030a0d] border border-[#2dd4bf]/30 text-white text-sm focus:outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl font-bold text-sm text-[#030a0d] bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#ffd700] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] whitespace-nowrap cursor-pointer"
                  >
                    <span>Try kanman</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-[#fbbf24] font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    7 days free. No credit card required.
                  </span>
                  <span className="hidden sm:inline text-slate-500">Instant setup in 30s</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Interactive 3D Robot Mascot (3 States: Default, Interaction Hover, Contextual AI Work) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <RobotMascot3D isAiWorking={isAiWorking} />
          </div>

        </div>
      </div>
    </section>
  );
}
