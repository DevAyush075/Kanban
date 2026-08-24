import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030a0d] text-slate-100 selection:bg-[#2dd4bf]/30 selection:text-[#fbbf24]">
      {children}
    </div>
  );
}
