'use client';

import React from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import AppDemoWorkspace from '@/components/landing/AppDemoWorkspace';
import ScrollPrompt from '@/components/landing/ScrollPrompt';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection from '@/components/landing/FaqSection';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  const handleStartConversation = (promptText: string) => {
    console.log('Started conversation with prompt:', promptText);
  };

  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24]">
      {/* Navigation Bar */}
      <Header />

      {/* Hero Section with Retro Robot Mascot, Headline, Description & CTA Card */}
      <main className="flex-grow">
        <HeroSection onStartConversation={handleStartConversation} />

        {/* Scroll Prompt with Mouse Icon */}
        <ScrollPrompt />

        {/* App Demo Workspace featuring Kanban Board, AI Chat & Dynamic Drag Overlay */}
        <AppDemoWorkspace />

        {/* Supporting Feature Highlights */}
        <FeaturesSection />

        {/* Pricing Options */}
        <PricingSection />

        {/* FAQ Accordion */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
