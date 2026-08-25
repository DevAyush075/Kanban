'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, AlertCircle, X, ChevronRight, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { askProjectAssistant, type AskAssistantResult } from '@/actions/ai-assistant';
import { type AssistantResponse } from '@/lib/validations/ai-assistant';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  response?: AssistantResponse;
  isError?: boolean;
}

interface AiAssistantPanelProps {
  boardId: string;
  boardName: string;
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "What should I work on next?",
  "Summarize this project.",
  "What are the biggest risks?",
  "What remains to finish this project?"
];

export default function AiAssistantPanel({ boardId, boardName, isOpen, onClose }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm your AI Project Assistant. I can analyze the "${boardName}" board and give you insights, summaries, and recommendations. What would you like to know?`
        }
      ]);
    }
  }, [isOpen, boardName, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const query = (overrideInput || input).trim();
    if (!query || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };
    
    setMessages(prev => [...prev, userMessage]);

    const res: AskAssistantResult = await askProjectAssistant({
      boardId,
      question: query
    });

    setIsLoading(false);

    if (!res.success || !res.response) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.message || "I encountered an error analyzing the board.",
          isError: true,
        }
      ]);
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        response: res.response
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#030d10] border-l border-[#2dd4bf]/20 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2dd4bf]/15 bg-[#07252d]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#0d4652] text-[#2dd4bf]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Project Assistant</h3>
            <p className="text-[10px] text-slate-400">Powered by Gemini AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0d4652] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-[#2dd4bf] text-[#030a0d] font-medium rounded-tr-sm' 
                  : msg.isError
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-sm'
                    : 'bg-[#072229] border border-[#2dd4bf]/20 text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.content && <p className="leading-relaxed">{msg.content}</p>}
              
              {msg.response && (
                <div className="space-y-4">
                  <p className="leading-relaxed">{msg.response.answer}</p>
                  
                  {msg.response.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#2dd4bf] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Recommendations
                      </h4>
                      {msg.response.recommendations.map((rec, i) => (
                        <div key={i} className="bg-[#030d10] rounded-lg p-2 border border-[#2dd4bf]/10 text-xs">
                          <p className="font-semibold text-white">{rec.taskId}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.response.risks.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Risks
                      </h4>
                      <ul className="list-disc list-inside text-xs text-rose-200 space-y-0.5 pl-1">
                        {msg.response.risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.response.nextActions.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Next Actions
                      </h4>
                      <ul className="text-xs text-emerald-200 space-y-1">
                        {msg.response.nextActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-[#072229] border border-[#2dd4bf]/20 rounded-2xl rounded-tl-sm p-3 text-sm text-[#2dd4bf] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="animate-pulse">Analyzing board...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#07252d] border-t border-[#2dd4bf]/15 space-y-3">
        {/* Suggestions Scroll */}
        <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-thin scrollbar-thumb-[#2dd4bf]/20">
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(undefined, suggestion)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-[#030d10] border border-[#2dd4bf]/20 text-[10px] font-medium text-slate-300 hover:text-white hover:border-[#2dd4bf]/50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this project..."
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1 max-h-32 min-h-[44px] bg-[#030d10] border border-[#2dd4bf]/30 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] resize-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#2dd4bf] text-[#030a0d] rounded-xl hover:bg-[#5eead4] transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
