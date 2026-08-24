'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-[#030d10]/90 backdrop-blur-md shadow-2xl' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Capsule Navigation Pill (Matching screenshot) */}
        <div className="flex items-center gap-6 bg-[#07252d]/85 backdrop-blur-xl border border-[#2dd4bf]/25 px-5 py-2.5 rounded-full shadow-lg">
          <Link href="/" className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk'] flex items-center gap-1">
            kanman<span className="text-[#2dd4bf]">.ai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-2">
            <Link
              href="#home"
              className="text-white font-semibold relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2dd4bf] after:rounded-full"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Utility Links & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-5 text-sm font-medium text-slate-300 mr-2">
            <Link href="#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="#docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="#blog" className="hover:text-white transition-colors">
              Blog
            </Link>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-[#2dd4bf] transition-colors"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="px-4.5 py-2 rounded-full border border-[#2dd4bf]/40 hover:border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-all font-semibold text-sm"
          >
            Register
          </Link>

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-[#030a0d] bg-gradient-to-r from-[#ffd700] via-[#fbbf24] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#ffd700] transition-all shadow-[0_0_25px_rgba(251,191,36,0.4)]"
          >
            <span>Go to App</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-[#072229]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#051419]/95 backdrop-blur-xl border-b border-[#2dd4bf]/20 px-4 pt-4 pb-6 space-y-4">
          <div className="flex flex-col space-y-3 font-medium text-slate-200">
            <Link
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-[#072229]/60 hover:text-[#2dd4bf]"
            >
              Home
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#072229]/60 hover:text-[#2dd4bf]"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#072229]/60 hover:text-[#2dd4bf]"
            >
              Pricing
            </Link>
          </div>

          <div className="pt-3 border-t border-[#2dd4bf]/20 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-slate-200 bg-[#072229] border border-[#2dd4bf]/30 hover:border-[#2dd4bf]"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-[#030a0d] bg-gradient-to-r from-[#2dd4bf] to-[#14b8a6] hover:opacity-95"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
