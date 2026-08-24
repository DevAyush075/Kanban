'use client';

import React from 'react';
import { Mouse, ChevronDown } from 'lucide-react';

export default function ScrollPrompt() {
  const scrollToDemo = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 group cursor-pointer" onClick={scrollToDemo}>
      <div className="relative flex flex-col items-center">
        {/* Glowing Mouse Icon */}
        <div className="w-8 h-12 rounded-full border-2 border-[#2dd4bf]/40 group-hover:border-[#fbbf24] bg-[#072229]/50 flex items-start justify-center p-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.2)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all">
          <div className="w-1.5 h-3 rounded-full bg-[#fbbf24] animate-bounce-slow" />
        </div>

        {/* Downward Arrow */}
        <ChevronDown className="w-4 h-4 text-[#2dd4bf] group-hover:text-[#fbbf24] mt-2 animate-bounce transition-colors" />

        <span className="text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-slate-200 mt-1 font-semibold transition-colors">
          Scroll to explore
        </span>
      </div>
    </div>
  );
}
