
import React from 'react';
import Logo from './Logo';
import UserProfileDropdown from './UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="md" />
        
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/' ? 'text-primary font-medium' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/calendar" 
              className={`text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/calendar' ? 'text-primary font-medium' : ''
              }`}
            >
              Calendar
            </Link>
            <Link 
              to="/goals" 
              className={`text-muted-foreground hover:text-primary transition-colors ${
                location.pathname === '/goals' ? 'text-primary font-medium' : ''
              }`}
            >
              Goals
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          {user && <UserProfileDropdown />}
        </div>
      </div>
    </header>
  );
};

export default Header;
