'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
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
} from 'lucide-react';
import RobotMascot3D from '@/components/landing/RobotMascot3D';
import { registerUser, ActionResult } from '@/actions/auth/register';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res: ActionResult = await registerUser(formData);

      if (!res.success) {
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        if (res.message) {
          setGeneralError(res.message);
        }
      } else {
        // Establish NextAuth session cookie upon registration
        try {
          await signIn('credentials', {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            redirect: false,
          });
        } catch (err) {
          console.warn('Auto signIn after registration error:', err);
        }

        setSuccessMessage(res.message || 'Account created successfully!');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24] relative overflow-hidden">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2dd4bf]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#fbbf24]/10 rounded-full blur-[160px] pointer-events-none" />

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
          className="flex items-center gap-2 bg-[#07252d]/80 backdrop-blur-md border border-[#2dd4bf]/30 px-5 py-2 rounded-full shadow-lg text-lg font-bold tracking-tight text-white font-['Space_Grotesk']"
        >
          kanman<span className="text-[#2dd4bf]">.ai</span>
        </Link>

        {/* Sign In Link */}
        <div className="text-sm font-medium text-slate-400 hidden sm:block">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-[#2dd4bf] hover:text-[#5eead4] font-semibold underline underline-offset-4 decoration-[#2dd4bf]/40 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Layout */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Feature Highlights */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#072229]/80 border border-[#2dd4bf]/30 text-xs font-semibold text-[#2dd4bf] tracking-wide uppercase shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>Join the AI-Powered Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
              Create your account &amp; supercharge your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] via-[#5eead4] to-[#fbbf24]">
                Kanban workflow
              </span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Unlock autonomous AI task breakdown, real-time drag-and-drop workspace collaboration, and intelligent project tracking.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              {[
                { title: 'Autonomous AI Task Generation', desc: 'Generate complete task structures with simple prompts' },
                { title: 'Interactive 3D Companion', desc: 'Real-time WebGL assistant guiding your workflow' },
                { title: 'Team Collaboration', desc: 'Manage boards, columns, and tasks with granular roles' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#072229]/50 border border-[#2dd4bf]/15">
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
            <div className="hidden lg:block relative h-56 w-full max-w-sm mx-auto">
              <RobotMascot3D className="w-full h-full" />
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#07252d]/85 backdrop-blur-2xl border border-[#2dd4bf]/30 shadow-[0_0_50px_rgba(7,34,41,0.8)]">
              
              {/* Form Title */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#0d4652] to-[#072229] border border-[#2dd4bf]/40 flex items-center justify-center text-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.25)]">
                  <KanbanIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                  Get Started for Free
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create your account in seconds
                </p>
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030d10]/80 border ${
                        fieldErrors.name ? 'border-rose-500/80 focus:ring-rose-500' : 'border-[#2dd4bf]/20 focus:border-[#2dd4bf]'
                      } text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.name[0]}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@company.com"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#030d10]/80 border ${
                        fieldErrors.confirmPassword ? 'border-rose-500/80 focus:ring-rose-500' : 'border-[#2dd4bf]/20 focus:border-[#2dd4bf]'
                      } text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.confirmPassword[0]}</p>
                  )}
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Hint */}
              <div className="mt-5 pt-4 border-t border-[#2dd4bf]/10 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
                <span>Protected with SSL Encryption &amp; Password Hashing</span>
              </div>
            </div>

            {/* Mobile Sign In Navigation */}
            <p className="mt-6 text-center text-sm text-slate-400 sm:hidden">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2dd4bf] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 border-t border-[#2dd4bf]/10 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} kanman.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
