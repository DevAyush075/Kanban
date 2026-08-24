'use client';

import React from 'react';
import {
  BrainCircuit,
  Kanban,
  Zap,
  Users,
  GitBranch,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-[#fbbf24]" />,
      title: 'Kanban as AI Memory',
      description:
        'Unlike stateless chatbots, kanman uses visual board columns as persistent memory so context is never forgotten.',
      badge: 'Core Engine'
    },
    {
      icon: <Kanban className="w-6 h-6 text-[#2dd4bf]" />,
      title: 'Autonomous Task Delegation',
      description:
        'Describe project goals in plain English. kanman breaks them down into subtasks, orders dependencies, and assigns work.',
      badge: 'Auto Execution'
    },
    {
      icon: <GitBranch className="w-6 h-6 text-purple-400" />,
      title: 'GitHub & CI/CD Integration',
      description:
        'Kanman moves tasks across Code Review and Done columns automatically as pull requests are opened and merged.',
      badge: 'Dev Native'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Real-Time Dynamic Sync',
      description:
        'Instant multi-user collaborative board updates with zero latency streaming across your team.',
      badge: 'Sub-10ms'
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: 'Human & AI Pair Management',
      description:
        'Shape board state manually or prompt the AI agent. Complete transparency over every card movement.',
      badge: 'Hybrid Mode'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Enterprise SOC-2 Compliance',
      description:
        'Your board memory and code repository data remain encrypted and isolated inside dedicated workspace tenants.',
      badge: 'Secure'
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#072229] border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf]">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Built for Modern AI Teams</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk'] leading-tight">
            Why management in <span className="text-[#2dd4bf]">kanban</span> beats chat threads
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Chat UI forgets. Kanban boards organize structured state that you can see, touch, and shape.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, i) => (
            <div
              key={i}
              className="group relative p-6 sm:p-8 rounded-2xl bg-[#05181e]/80 border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[#06b6d4]/10"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#072229] border border-[#2dd4bf]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#0d4652]/40 text-[#2dd4bf] border border-[#2dd4bf]/20">
                  {feat.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#2dd4bf] transition-colors font-['Space_Grotesk']">
                {feat.title}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
