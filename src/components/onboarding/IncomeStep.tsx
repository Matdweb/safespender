
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from './OnboardingFlow';

interface IncomeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const IncomeStep = ({ onNext, onBack }: IncomeStepProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('biweekly');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!description.trim()) {
      newErrors.description = 'Please describe your income source';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({
        income: {
          amount: parseFloat(amount),
          date,
          frequency: frequency as 'one-time' | 'weekly' | 'biweekly' | 'monthly',
          description: description || 'Income'
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">💼</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Let's start with your income
          </h2>
          <p className="text-muted-foreground">
            Tell us about your regular income - you can allocate it to different purposes later
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="amount">💰 How much do you receive?</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`pl-8 ${errors.amount ? 'border-destructive' : ''}`}
              step="0.01"
              min="0"
            />
          </div>
          {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">📝 What's this income from?</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Salary, Freelance work, Side hustle"
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">📅 When do you expect it?</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>🔁 How often does this repeat?</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-time only</SelectItem>
              <SelectItem value="weekly">Every week</SelectItem>
              <SelectItem value="biweekly">Every 2 weeks</SelectItem>
              <SelectItem value="monthly">Every month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Don't worry about allocating your income right now. You can organize it into budgets, bills, and savings later using the dashboard.
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default IncomeStep;
