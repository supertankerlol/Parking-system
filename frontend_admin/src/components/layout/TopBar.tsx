import React from 'react';
import { Search, Bell, Maximize, HelpCircle, Sun, Moon, UserCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { FACILITIES } from '../../utils/mockData';
import { useTheme } from '../../hooks/useTheme';

interface TopBarProps {
  currentFacility: string;
  setCurrentFacility: (facilityId: string) => void;
}

export function TopBar({ currentFacility, setCurrentFacility }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Facility Selector */}
      <div className="flex items-center gap-4 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              <span className="font-medium">{FACILITIES.find(f => f.id === currentFacility)?.name || 'Select Facility'}</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-2">
                {FACILITIES.find(f => f.id === currentFacility)?.status === 'online' ? 'Online' : 'Alert'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[240px]">
            <DropdownMenuLabel>Your Facilities</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FACILITIES.map(facility => (
              <DropdownMenuItem 
                key={facility.id} 
                onClick={() => setCurrentFacility(facility.id)}
                className="justify-between cursor-pointer"
              >
                {facility.name}
                <span className={`w-2 h-2 rounded-full ${facility.status === 'online' ? 'bg-green-500' : 'bg-amber-500'}`} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search drivers, plates, bookings..." 
          className="pl-10 bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hidden sm:flex">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary hidden sm:flex relative"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Moon className="w-5 h-5 scale-100 rotate-0 dark:scale-0 dark:-rotate-90 transition-transform" />
          <Sun className="absolute w-5 h-5 scale-0 rotate-90 dark:scale-100 dark:rotate-0 transition-transform" />
        </Button>
      </div>
    </header>
  );
}
