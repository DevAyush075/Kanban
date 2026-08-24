import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "kanman.ai — World's First AI That Thinks in Kanban",
  description:
    'The first project management AI that thinks in kanban. Describe your goals in plain language. kanman organizes, delegates, and delivers using kanban boards as structured memory.',
  keywords: [
    'kanman.ai',
    'AI Kanban',
    'AI Project Management',
    'Autonomous AI Agent',
    'Kanban Memory'
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030a0d] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
