
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [allocation, setAllocation] = useState('free-spend');
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
          allocation: allocation as 'free-spend' | 'bills' | 'savings' | 'mixed',
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
            Let's start with your next paycheck
          </h2>
          <p className="text-muted-foreground">
            This helps us calculate how much you'll have available to spend
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="amount">💰 How much do you expect to receive?</Label>
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

        <div className="space-y-3">
          <Label>🧩 How would you like to allocate this?</Label>
          <RadioGroup value={allocation} onValueChange={setAllocation}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free-spend" id="free-spend" />
              <Label htmlFor="free-spend" className="text-sm">
                💸 Available to spend freely
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bills" id="bills" />
              <Label htmlFor="bills" className="text-sm">
                🧾 Reserved for bills & expenses
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="savings" id="savings" />
              <Label htmlFor="savings" className="text-sm">
                💰 Direct to savings goals
              </Label>
            </div>
          </RadioGroup>
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
