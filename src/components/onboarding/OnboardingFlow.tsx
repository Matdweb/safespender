
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import WelcomeStep from './WelcomeStep';
import CurrencyStep from './CurrencyStep';
import IncomeStep from './IncomeStep';
import ExpensesStep from './ExpensesStep';
import GoalsStep from './GoalsStep';
import SummaryStep from './SummaryStep';
import { useFinancial } from '@/contexts/FinancialContext';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

export type OnboardingData = {
  incomes?: Array<{
    amount: number;
    date: string;
    frequency: 'one-time' | 'weekly' | 'biweekly' | 'monthly';
    description: string;
  }>;
  expenses: Array<{
    description: string;
    amount: number;
    category: string;
    recurring?: {
      type: 'weekly' | 'monthly' | 'biweekly';
      interval: number;
    };
    dayOfMonth?: number;
  }>;
  goal?: {
    name: string;
    targetAmount: number;
    recurringContribution: number;
    contributionFrequency: 'weekly' | 'biweekly' | 'monthly';
    icon: string;
  };
};

const OnboardingFlow = ({ open, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    expenses: []
  });
  const { completeOnboarding } = useFinancial();

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: CurrencyStep, title: 'Currency' },
    { component: IncomeStep, title: 'Income' },
    { component: ExpensesStep, title: 'Expenses' },
    { component: GoalsStep, title: 'Goals' },
    { component: SummaryStep, title: 'Summary' }
  ];

  const currentStepData = steps[currentStep];
  const CurrentComponent = currentStepData.component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setOnboardingData(prev => ({ ...prev, ...stepData }));
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    completeOnboarding();
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0" onEscapeKeyDown={handleClose}>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground pt-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{currentStepData.title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="animate-fade-in">
            <CurrentComponent
              data={onboardingData}
              onNext={handleNext}
              onBack={currentStep > 0 ? handleBack : undefined}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;
