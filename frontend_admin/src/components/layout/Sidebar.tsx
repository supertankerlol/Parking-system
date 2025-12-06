import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Camera, 
  Users, 
  Settings, 
  Bell, 
  CreditCard, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
  { id: 'map', label: 'Facility Map', icon: MapIcon },
  { id: 'cameras', label: 'Live Cameras', icon: Camera },
  { id: 'bookings', label: 'Bookings & Revenue', icon: CreditCard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen bg-background border-r border-border sticky top-0 left-0 z-40 flex flex-col shadow-xl"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
            <div className="w-6 h-6 bg-white rounded-full border-4 border-primary" />
          </div>
          <motion.div 
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            className="whitespace-nowrap"
          >
            <h1 className="font-bold text-xl tracking-tight">Park<span className="text-primary">OS</span></h1>
          </motion.div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                className="whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>

              {isActive && !collapsed && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Snippet */}
      <div className="p-4 border-t border-border">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1672685667592-0392f458f46f?auto=format&fit=crop&q=80&w=100" 
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-background ring-2 ring-border"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
          </div>
          
          <motion.div 
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            className="overflow-hidden"
          >
            <p className="text-sm font-semibold truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">Operator</p>
          </motion.div>
          
          {!collapsed && (
             <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-destructive">
               <LogOut className="w-4 h-4" />
             </Button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
