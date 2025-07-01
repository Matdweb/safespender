
import React, { useState } from 'react';
import Logo from './Logo';
import UserProfileDropdown from './UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header = ({ darkMode, toggleDarkMode }: HeaderProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/goals', label: 'Goals' }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="md" />
        
        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-6">
            {navigationLinks.map(({ to, label }) => (
              <Link 
                key={to}
                to={to} 
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  isActivePath(to) ? 'text-primary font-medium' : ''
                }`}
              >
                {label}
              </Link>
            ))}
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
          
          {user && (
            <>
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden rounded-full"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navigationLinks.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium transition-colors p-3 rounded-lg ${
                          isActivePath(to) 
                            ? 'text-primary bg-primary/10' 
                            : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t pt-4">
                      <UserProfileDropdown />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Profile */}
              <div className="hidden md:block">
                <UserProfileDropdown />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
