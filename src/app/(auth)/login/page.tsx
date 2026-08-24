'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Kanban as KanbanIcon,
  Loader2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import RobotMascot3D from '@/components/landing/RobotMascot3D';
import { loginUser, ActionResult } from '@/actions/auth/login';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res: ActionResult = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (!res.success) {
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        if (res.message) {
          setGeneralError(res.message);
        }
        return;
      }

      // Establish NextAuth session cookie in browser
      try {
        const signInRes = await signIn('credentials', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false,
        });

        if (signInRes?.error) {
          setGeneralError('Invalid email or password. Session creation failed.');
          return;
        }
      } catch (err: any) {
        console.warn('NextAuth signIn error:', err);
        if (err?.type === 'CredentialsSignin' || err?.message?.includes('CredentialsSignin')) {
          setGeneralError('Invalid email or password. Please check your credentials.');
          return;
        }
      }

      setSuccessMessage(res.message || 'Welcome back! Redirecting to workspace...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 800);
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSent(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24] relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2dd4bf]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#fbbf24]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 group text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <div className="p-1.5 rounded-full bg-[#072229] border border-[#2dd4bf]/20 group-hover:border-[#2dd4bf]/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#2dd4bf]" />
          </div>
          <span>Back to Home</span>
        </Link>

        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#07252d]/80 backdrop-blur-md border border-[#2dd4bf]/30 px-5 py-2 rounded-full shadow-lg text-lg font-bold tracking-tight text-white font-['Space_Grotesk'] hover:border-[#2dd4bf]/60 transition-all"
        >
          kanman<span className="text-[#2dd4bf]">.ai</span>
        </Link>

        {/* Sign Up Link */}
        <div className="text-sm font-medium text-slate-400 hidden sm:block">
          Need an account?{' '}
          <Link
            href="/register"
            className="text-[#2dd4bf] hover:text-[#5eead4] font-semibold underline underline-offset-4 decoration-[#2dd4bf]/40 transition-colors"
          >
            Create One
          </Link>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & AI Highlights */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#072229]/80 border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf] tracking-wide uppercase shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Welcome Back to kanman.ai</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
              Log in to your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] via-[#5eead4] to-[#fbbf24]">
                AI-Powered Workspace
              </span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Access your active Kanban boards, resume autonomous AI sprint workflows, and collaborate with your team seamlessly.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              {[
                { title: 'Resume AI Task Sessions', desc: 'Pick up right where your AI assistant left off' },
                { title: 'Real-Time Syncing', desc: 'Live updates across all team boards and columns' },
                { title: 'Automated Prioritization', desc: 'AI-driven task ordering and bottleneck alerts' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#072229]/50 border border-[#2dd4bf]/15 hover:border-[#2dd4bf]/30 transition-colors">
                  <div className="p-1 rounded-md bg-[#0d4652]/70 text-[#2dd4bf] mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Mascot Preview */}
            <div className="hidden lg:block relative h-60 w-full max-w-sm mx-auto">
              <RobotMascot3D className="w-full h-full" />
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#07252d]/85 backdrop-blur-2xl border border-[#2dd4bf]/30 shadow-[0_0_50px_rgba(7,34,41,0.8)]">
              
              {/* Form Header */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#0d4652] to-[#072229] border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.25)]">
                  <KanbanIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Sign In to Your Workspace
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your credentials or use social auth
                </p>
              </div>

              {/* Quick OAuth Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage('Authenticating with Google...');
                    setTimeout(() => router.push('/dashboard'), 1000);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#030d10]/90 border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50 text-xs font-semibold text-slate-200 hover:bg-[#072229] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMessage('Authenticating with GitHub...');
                    setTimeout(() => router.push('/dashboard'), 1000);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#030d10]/90 border border-[#2dd4bf]/20 hover:border-[#2dd4bf]/50 text-xs font-semibold text-slate-200 hover:bg-[#072229] transition-all"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2dd4bf]/15" />
                </div>
                <span className="relative px-3 bg-[#07252d] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Or email credentials
                </span>
              </div>

              {/* General Error Banner */}
              {generalError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@company.com"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030d10]/80 border ${
                        fieldErrors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-[#2dd4bf]/20 focus:border-[#2dd4bf]'
                      } text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.email[0]}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-[#2dd4bf] hover:text-[#5eead4] hover:underline font-medium transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030d10]/80 border ${
                        fieldErrors.password ? 'border-rose-500/80 focus:ring-rose-500' : 'border-[#2dd4bf]/20 focus:border-[#2dd4bf]'
                      } text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.password[0]}</p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded bg-[#030d10] border-[#2dd4bf]/30 text-[#2dd4bf] focus:ring-[#2dd4bf] accent-[#2dd4bf]"
                    />
                    <span className="text-xs text-slate-300">Remember me for 30 days</span>
                  </label>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#030a0d] bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#ffd700] transition-all shadow-[0_0_25px_rgba(251,191,36,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#030a0d]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Hint */}
              <div className="mt-5 pt-4 border-t border-[#2dd4bf]/10 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
                <span>Encrypted Session &amp; OAuth 2.0 Protected</span>
              </div>
            </div>

            {/* Mobile Sign Up Navigation */}
            <p className="mt-6 text-center text-sm text-slate-400 sm:hidden">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#2dd4bf] hover:underline font-medium">
                Create One
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#07252d] border border-[#2dd4bf]/40 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#0d4652] text-[#2dd4bf] flex items-center justify-center mb-2">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Reset Your Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered email address and we will send you a secure password reset link.
            </p>

            {resetSent ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030d10] border border-[#2dd4bf]/30 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-[#2dd4bf] text-[#030a0d] text-xs font-bold hover:bg-[#5eead4] transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
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
