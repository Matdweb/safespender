
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface IncomeEntry {
  amount: string;
  date: string;
  description: string;
}

interface IncomeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const IncomeStep = ({ onNext, onBack }: IncomeStepProps) => {
  const [frequency, setFrequency] = useState('biweekly');
  const [incomes, setIncomes] = useState<IncomeEntry[]>([
    { amount: '', date: new Date().toISOString().split('T')[0], description: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addIncomeEntry = () => {
    setIncomes(prev => [...prev, { 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      description: '' 
    }]);
  };

  const removeIncomeEntry = (index: number) => {
    if (incomes.length > 1) {
      setIncomes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateIncomeEntry = (index: number, field: keyof IncomeEntry, value: string) => {
    setIncomes(prev => prev.map((income, i) => 
      i === index ? { ...income, [field]: value } : income
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    incomes.forEach((income, index) => {
      if (!income.amount || parseFloat(income.amount) <= 0) {
        newErrors[`amount-${index}`] = 'Please enter a valid amount';
      }
      if (!income.description.trim()) {
        newErrors[`description-${index}`] = 'Please describe this income source';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Convert multiple incomes to multiple income transactions
      const incomeTransactions = incomes.map(income => ({
        amount: parseFloat(income.amount),
        date: income.date,
        frequency: frequency as 'one-time' | 'weekly' | 'biweekly' | 'monthly',
        description: income.description || 'Income'
      }));

      onNext({
        incomes: incomeTransactions
      });
    }
  };

  const getSuggestedEntries = () => {
    switch (frequency) {
      case 'biweekly':
        return 2; // Most people get paid twice a month
      case 'weekly':
        return 1; // Usually one weekly paycheck
      case 'monthly':
        return 1; // One monthly payment
      default:
        return 1;
    }
  };

  // Auto-adjust entries when frequency changes
  React.useEffect(() => {
    const suggested = getSuggestedEntries();
    if (frequency === 'biweekly' && incomes.length === 1) {
      // Add second income for biweekly
      setIncomes(prev => [...prev, { 
        amount: '', 
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        description: '' 
      }]);
    }
  }, [frequency]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">💼</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Let's set up your income
          </h2>
          <p className="text-muted-foreground">
            Tell us about your regular income - you can organize it later
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-3">
          <Label>🔁 How often do you get paid?</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Every week</SelectItem>
              <SelectItem value="biweekly">Every 2 weeks</SelectItem>
              <SelectItem value="monthly">Every month</SelectItem>
              <SelectItem value="one-time">One-time only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>💰 Your {frequency === 'one-time' ? 'income' : 'paychecks'}</Label>
            {frequency !== 'one-time' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIncomeEntry}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          {incomes.map((income, index) => (
            <Card key={index} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {frequency === 'one-time' ? 'Income' : `Paycheck ${index + 1}`}
                </h4>
                {incomes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIncomeEntry(index)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`amount-${index}`}>Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      value={income.amount}
                      onChange={(e) => updateIncomeEntry(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      className={`pl-8 ${errors[`amount-${index}`] ? 'border-destructive' : ''}`}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors[`amount-${index}`] && <p className="text-sm text-destructive">{errors[`amount-${index}`]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={income.description}
                    onChange={(e) => updateIncomeEntry(index, 'description', e.target.value)}
                    placeholder="e.g., Salary, Freelance, Side job"
                    className={errors[`description-${index}`] ? 'border-destructive' : ''}
                  />
                  {errors[`description-${index}`] && <p className="text-sm text-destructive">{errors[`description-${index}`]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`date-${index}`}>Next payment date</Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={income.date}
                    onChange={(e) => updateIncomeEntry(index, 'date', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 Don't worry about budgeting your income right now. You can organize it into bills, savings, and spending money later from your dashboard.
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
