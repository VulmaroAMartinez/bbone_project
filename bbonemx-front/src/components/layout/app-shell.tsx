'use client';

import React, { useState } from "react"

import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
      <div className="min-h-screen bg-background">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(c => !c)} />
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
          <Header title={title} subtitle={subtitle} />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
  );
}
