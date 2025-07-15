import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AddGoalModal from '@/components/goals/AddGoalModal';
import { OnboardingData } from './OnboardingFlow';
import { Target } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useFinancialData';

interface GoalsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const GoalsStep = ({ data, onNext, onBack }: GoalsStepProps) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const { data: goals } = useSavingsGoals();

  const hasGoal = goals && goals.length > 0;

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
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Set a Savings Goal</h2>
        <p className="text-muted-foreground">
          Create your first savings goal to stay motivated and track your progress.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {!hasGoal ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Whether it's an emergency fund, vacation, or new gadget - set a goal to save toward.
              </p>
              <Button
                onClick={() => setShowGoalModal(true)}
                className="w-full"
                size="lg"
              >
                Create Savings Goal
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <p className="text-green-600 font-medium">Goal created successfully!</p>
              <div className="space-y-2">
                {goals?.map((goal) => (
                  <Card key={goal.id} className="p-3 bg-green-50 border-green-200">
                    <p className="text-sm">
                      {goal.icon} {goal.name} - ${goal.target_amount.toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
              <Button
                onClick={() => setShowGoalModal(true)}
                variant="outline"
                size="sm"
              >
                Add Another Goal
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 Goals help you stay focused and motivated. You can always modify or add more goals later!
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

      <AddGoalModal
        open={showGoalModal}
        onOpenChange={setShowGoalModal}
      />
    </div>
  );
};

export default GoalsStep;