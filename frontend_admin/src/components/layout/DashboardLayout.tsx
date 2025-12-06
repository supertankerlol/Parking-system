import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentFacility, setCurrentFacility] = useState('fac_1');

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar currentFacility={currentFacility} setCurrentFacility={setCurrentFacility} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
