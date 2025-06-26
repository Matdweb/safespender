
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const LoadingScreen = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  
  const phrases = [
    "Calculating your financial calm...",
    "Lining up your next paycheck...",
    "Stacking your savings..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
        {/* Animated Logo */}
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-6">
          {/* Pulsing Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse"></div>
          </div>

          {/* Floating Coin Animation */}
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white font-bold text-sm">$</span>
            </div>
          </div>
        </div>

        {/* Cycling Phrases */}
        <div className="text-center min-h-[24px]">
          <p 
            key={currentPhrase}
            className="text-muted-foreground text-sm animate-fade-in transition-opacity duration-500"
          >
            {phrases[currentPhrase]}
          </p>
        </div>

        {/* Subtle Shadow Container */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
