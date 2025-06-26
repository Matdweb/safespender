
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Main Error Content */}
        <div className="space-y-6">
          {/* 404 Title */}
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              You're Off Budget!
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg">
            Looks like this page went into overdraft.<br />
            Let's get you back on track.
          </p>

          {/* Fun Visual Element */}
          <div className="flex justify-center my-8">
            <div className="relative">
              {/* Empty Wallet Animation */}
              <div className="w-24 h-16 bg-card border-2 border-border rounded-lg flex items-center justify-center animate-bounce">
                <div className="w-16 h-8 bg-muted rounded border border-border flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Empty</span>
                </div>
              </div>
              
              {/* Floating Coins */}
              <div className="absolute -top-4 -right-2 w-6 h-6 bg-primary rounded-full animate-pulse">
                <span className="text-white text-xs flex items-center justify-center h-full">$</span>
              </div>
              <div className="absolute -top-6 left-2 w-4 h-4 bg-primary/70 rounded-full animate-pulse [animation-delay:0.5s]">
                <span className="text-white text-xs flex items-center justify-center h-full">¢</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="hover-lift">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()} className="hover-lift">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
