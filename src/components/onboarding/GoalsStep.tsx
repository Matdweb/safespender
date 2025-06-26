
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { OnboardingData } from './OnboardingFlow';

interface GoalsStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const GoalsStep = ({ onNext, onBack }: GoalsStepProps) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contribution, setContribution] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [selectedIcon, setSelectedIcon] = useState('💰');

  const goalIcons = ['💰', '🏖️', '🚗', '🏠', '💻', '📱', '🎓', '💍', '✈️', '🎯'];
  const goalSuggestions = [
    { name: 'Emergency Fund', icon: '🛡️', amount: '5000' },
    { name: 'Vacation Fund', icon: '🏖️', amount: '3000' },
    { name: 'New Laptop', icon: '💻', amount: '1500' },
    { name: 'New Car', icon: '🚗', amount: '15000' },
    { name: 'House Down Payment', icon: '🏠', amount: '25000' }
  ];

  const handleSuggestionClick = (suggestion: typeof goalSuggestions[0]) => {
    setGoalName(suggestion.name);
    setTargetAmount(suggestion.amount);
    setSelectedIcon(suggestion.icon);
  };

  const handleNext = () => {
    if (goalName && targetAmount) {
      onNext({
        goal: {
          name: goalName,
          targetAmount: parseFloat(targetAmount),
          recurringContribution: parseFloat(contribution) || 0,
          contributionFrequency: frequency as 'weekly' | 'biweekly' | 'monthly',
          icon: selectedIcon
        }
      });
    } else {
      onNext({});
    }
  };

  const calculateTimeToGoal = () => {
    if (!targetAmount || !contribution) return null;
    
    const target = parseFloat(targetAmount);
    const monthlyContribution = parseFloat(contribution);
    
    if (monthlyContribution <= 0) return null;
    
    const frequencyMultiplier = frequency === 'weekly' ? 4.33 : frequency === 'biweekly' ? 2.17 : 1;
    const actualMonthlyContribution = monthlyContribution * frequencyMultiplier;
    const months = Math.ceil(target / actualMonthlyContribution);
    
    if (months <= 12) {
      return `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} year${years === 1 ? '' : 's'}${remainingMonths > 0 ? ` and ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}` : ''}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎯</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What are you saving for?
          </h2>
          <p className="text-muted-foreground">
            Set your first savings goal to stay motivated (you can skip this for now)
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Quick suggestions:</h3>
          <div className="grid grid-cols-1 gap-2">
            {goalSuggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{suggestion.icon}</span>
                  <div>
                    <p className="font-medium">{suggestion.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(suggestion.amount).toLocaleString()} goal
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold">Or create your own:</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-name">🏁 Goal name</Label>
              <Input
                id="goal-name"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Trip to Paris, New Gaming PC"
              />
            </div>

            <div>
              <Label htmlFor="target-amount">🎯 Target amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="target-amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label>Choose an icon:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                      selectedIcon === icon 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="contribution">💸 How much can you save?</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="contribution"
                  type="number"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="frequency">🔁 How often?</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Every week</SelectItem>
                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                  <SelectItem value="monthly">Every month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {calculateTimeToGoal() && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-center">
                  <span className="font-semibold">🎉 You'll reach your goal in {calculateTimeToGoal()}!</span>
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
          {goalName && targetAmount ? 'Continue' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
};

export default GoalsStep;
