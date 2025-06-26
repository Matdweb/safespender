
import React from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <Logo size="lg" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Ready to take control of your cash flow? 💪
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Let's set up your financial foundation in just a few quick steps. 
            This will only take 2 minutes!
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">What we'll set up:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <span>Your income</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🧾</span>
            <span>Upcoming bills</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>First savings goal</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onNext}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg hover-lift"
      >
        Let's get started! 🚀
      </Button>
    </div>
  );
};

export default WelcomeStep;
