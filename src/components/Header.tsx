
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { useShepherdTour } from '@/hooks/useShepherdTour';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { startTour, resetTour, hasSeenTour } = useShepherdTour();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStartTour = () => {
    if (location.pathname !== '/') {
      toast({
        title: "Starting Tour",
        description: "Redirecting to dashboard to begin the feature tour...",
      });
    }
    startTour();
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-scale">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                data-tour="calendar-nav"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/calendar') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Calendar
              </Link>
              <Link
                to="/goals"
                data-tour="goals-nav"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/goals') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Goals
              </Link>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-9 w-9 p-0"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <>
                {/* Help Button - Desktop */}
                <div className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartTour}
                    className="h-9 px-3"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </div>

                {/* User Profile Dropdown */}
                <div className="hidden md:block">
                  <UserProfileDropdown />
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden h-9 w-9 p-0"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && user && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="flex flex-col space-y-1 px-4 py-4">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/calendar') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Calendar
              </Link>
              <Link
                to="/goals"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/goals') 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-muted'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Goals
              </Link>
              
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={handleStartTour}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors flex items-center"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Feature Tour
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
