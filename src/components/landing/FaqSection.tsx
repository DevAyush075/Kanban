'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What does "AI that thinks in kanban" mean?',
      answer:
        'Traditional AI tools process conversations as disposable linear text streams. kanman uses Kanban boards as structured, persistent memory. When you prompt kanman with goals, it organizes them into columns (Backlog, Ready, Development, Code Review, Done), tracks dependencies, and maintains clear state.'
    },
    {
      question: 'Is a credit card required for the 7-day free trial?',
      answer:
        'No credit card is required to start your 7-day free trial. You get full access to all Pro features immediately upon sign-up.'
    },
    {
      question: 'Can I integrate kanman with my existing GitHub repo?',
      answer:
        'Yes! kanman connects to GitHub repositories via webhook or OAuth. When AI agents write code or submit pull requests, cards automatically transition across board columns based on commit and merge status.'
    },
    {
      question: 'Can human team members drag cards while the AI is active?',
      answer:
        'Absolutely. kanman supports hybrid human-AI collaboration. You can manually drag task cards or update descriptions anytime, and the AI agent instantly respects the updated state.'
    },
    {
      question: 'How secure is my project data and code memory?',
      answer:
        'We enforce strict SOC-2 Type II compliant encryption at rest and in transit. Your project data is never used to train global public AI models.'
    }
  ];

  return (
    <section id="faq" className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#072229] border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf]">
            <HelpCircle className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Got questions? We've got <span className="text-[#2dd4bf]">answers</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#05181e]/80 border border-[#2dd4bf]/20 overflow-hidden transition-all backdrop-blur-xl"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white font-['Space_Grotesk'] hover:text-[#2dd4bf] transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#2dd4bf] shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180 text-[#fbbf24]' : ''
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 pb-6 pt-1 text-slate-300 text-sm leading-relaxed border-t border-slate-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
