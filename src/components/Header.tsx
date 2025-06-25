
import React from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  return (
    <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="md" />
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            Calendar
          </a>
          <a href="#" className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
            Goals
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
