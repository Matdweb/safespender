import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SetSalaryModal from '@/components/SetSalaryModal';
import { OnboardingData } from './OnboardingFlow';
import { Briefcase } from 'lucide-react';
import { useSalary } from '@/hooks/useSalary';

interface SalaryStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const SalaryStep = ({ data, onNext, onBack }: SalaryStepProps) => {
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const { data: currentSalary } = useSalary();

  const handleNext = () => {
    onNext({});
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Set Up Your Salary</h2>
        <p className="text-muted-foreground">
          Configure your income schedule so SafeSpender can predict your cash flow.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {!currentSalary ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Click below to configure your salary details, including payment schedule and amounts.
              </p>
              <Button
                onClick={() => setShowSalaryModal(true)}
                className="w-full"
                size="lg"
              >
                Configure Salary
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <p className="text-green-600 font-medium">Salary configured successfully!</p>
              <Button
                onClick={() => setShowSalaryModal(true)}
                variant="outline"
                size="sm"
              >
                Edit Configuration
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 If your income is irregular, you can skip this step and add incomes manually as they come.
        </p>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button variant="outline" onClick={handleSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continue
        </Button>
      </div>

      <SetSalaryModal
        open={showSalaryModal}
        onOpenChange={setShowSalaryModal}
      />
    </div>
  );
};

export default SalaryStep;