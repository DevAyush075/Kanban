'use client';

import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'Forever Free',
      description: 'Ideal for solo developers exploring AI Kanban workflows.',
      features: [
        '1 Active Kanban Board',
        '50 AI Conversations / month',
        'Basic Task Drag & Drop',
        'Community Support'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For growing teams requiring autonomous task execution.',
      features: [
        'Unlimited Kanban Boards',
        'Unlimited AI Conversations',
        'Autonomous Task Card Dragging',
        'GitHub & CI/CD Integrations',
        'Priority AI Processing',
        '7 Days Free Trial included'
      ],
      cta: 'Start 7-Day Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$49',
      period: 'per user / month',
      description: 'Dedicated infrastructure, custom SLA, and SOC-2 security.',
      features: [
        'Everything in Pro',
        'Custom Fine-Tuned AI Models',
        'Dedicated Cloud Sandbox',
        'SOC-2 Type II Compliance',
        '24/7 VIP Engineering Support'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#072229] border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf]">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Simple Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
            Ready to give your AI a <span className="text-[#fbbf24]">kanban brain?</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No credit card required for 7 days free. Cancel anytime with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[#072830] via-[#051a20] to-[#041014] border-2 border-[#fbbf24] shadow-[0_0_40px_rgba(251,191,36,0.25)] scale-105 z-10'
                  : 'bg-[#05181e]/80 border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/40 backdrop-blur-xl'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#ffd700] to-[#fbbf24] text-[#030a0d] text-xs font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-[#030a0d]" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400 ml-2 font-medium">
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf]">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href="/register"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center block transition-all shadow-md ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] text-[#030a0d] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                      : 'bg-[#072229] border border-[#2dd4bf]/30 text-white hover:bg-[#2dd4bf] hover:text-[#030a0d]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
