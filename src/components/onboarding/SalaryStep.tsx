import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface SalaryStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const SalaryStep = ({ onNext, onBack }: SalaryStepProps) => {
  const [frequency, setFrequency] = useState('biweekly');
  const [payDays, setPayDays] = useState<string[]>(['15', '30']);
  const [quarterlyAmounts, setQuarterlyAmounts] = useState([
    { quarter: 'Q1', amount: '' },
    { quarter: 'Q2', amount: '' },
    { quarter: 'Q3', amount: '' },
    { quarter: 'Q4', amount: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPayDay = () => {
    const maxDays = frequency === 'weekly' ? 4 : frequency === 'biweekly' ? 2 : 3;
    if (payDays.length < maxDays) {
      setPayDays([...payDays, '']);
    }
  };

  const removePayDay = (index: number) => {
    if (payDays.length > 1) {
      setPayDays(payDays.filter((_, i) => i !== index));
    }
  };

  const updatePayDay = (index: number, value: string) => {
    const newPayDays = [...payDays];
    newPayDays[index] = value;
    setPayDays(newPayDays);
  };

  const updateQuarterlyAmount = (quarter: string, amount: string) => {
    setQuarterlyAmounts(prev => prev.map(q => 
      q.quarter === quarter ? { ...q, amount } : q
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate pay days
    payDays.forEach((day, index) => {
      const dayNum = parseInt(day);
      let maxDay = 31;
      let errorMessage = 'Enter a valid day (1-31)';
      
      if (frequency === 'weekly') {
        maxDay = 7;
        errorMessage = 'Enter a valid day of week (1-7)';
      } else if (frequency === 'yearly') {
        maxDay = 365;
        errorMessage = 'Enter a valid day of year (1-365)';
      }
      
      if (!day || isNaN(dayNum) || dayNum < 1 || dayNum > maxDay) {
        newErrors[`payDay-${index}`] = errorMessage;
      }
    });

    // Check for duplicate pay days
    const uniqueDays = new Set(payDays.filter(d => d && !isNaN(parseInt(d))));
    if (uniqueDays.size !== payDays.filter(d => d).length) {
      newErrors.payDays = 'Pay days must be unique';
    }

    // Validate quarterly amounts - at least one must be filled
    const hasValidAmount = quarterlyAmounts.some(q => q.amount && parseFloat(q.amount) > 0);
    if (!hasValidAmount) {
      newErrors.amounts = 'Enter at least one salary amount';
    } else {
      // Check individual amounts
      quarterlyAmounts.forEach(q => {
        if (q.amount && parseFloat(q.amount) <= 0) {
          newErrors[`amount-${q.quarter}`] = 'Enter a valid amount';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({
        salary: {
          frequency: frequency as 'weekly' | 'biweekly' | 'monthly' | 'yearly',
          daysOfMonth: payDays.map(d => parseInt(d)).filter(d => !isNaN(d)),
          quarterlyAmounts: quarterlyAmounts
            .filter(q => q.amount && parseFloat(q.amount) > 0)
            .map(q => ({
              quarter: q.quarter,
              amount: parseFloat(q.amount)
            }))
        }
      });
    }
  };

  const handleSkip = () => {
    onNext({});
  };

   useEffect(() => {
      // Update quarterlyAmounts based on frequency
      switch (frequency) {
        case 'biweekly':
          setQuarterlyAmounts([
            { quarter: 'First Paycheck', amount: '' },
            { quarter: 'Second Paycheck', amount: '' }
          ]);
          break;
        case 'monthly':
          setQuarterlyAmounts([
            { quarter: 'Monthly Pay', amount: '' }
          ]);
          break;
        case 'yearly':
          setQuarterlyAmounts([
            { quarter: 'Annual Salary', amount: '' }
          ]);
          break;
        case 'weekly':
          setQuarterlyAmounts([
            { quarter: 'Weekly Pay', amount: '' }
          ]);
          break;
        default:
          setQuarterlyAmounts([
            { quarter: 'Pay Amount', amount: '' }
          ]);
          break;
      }

      // Dynamically update payDays based on frequency
      switch (frequency) {
        case 'weekly':
          // For weekly, default to Fridays (5th day of week)
          setPayDays(['5']);
          break;
        case 'biweekly':
          // For biweekly, default to 15th and 30th
          setPayDays(['15', '30']);
          break;
        case 'monthly':
          // For monthly, default to 15th
          setPayDays(['15']);
          break;
        case 'yearly':
          // For yearly, default to 1st (start of year)
          setPayDays(['1']);
          break;
        default:
          setPayDays(['15']);
      }
    }, [frequency]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">💼</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Set up your salary
          </h2>
          <p className="text-muted-foreground">
            Configure your regular income so we can plan your finances automatically
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        {/* Frequency Selection */}
        <div className="space-y-3">
          <Label>💼 How often are you paid per year?</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly (52 times/year)</SelectItem>
              <SelectItem value="biweekly">Bi-weekly (26 times/year)</SelectItem>
              <SelectItem value="monthly">Monthly (12 times/year)</SelectItem>
              <SelectItem value="yearly">Yearly (1 time/year)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pay Days */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>
              📅 {frequency === 'weekly' ? 'Which days of the week are you paid?' : 
                   frequency === 'yearly' ? 'Which month/day are you paid?' : 
                   'Which days of the month are you paid?'}
            </Label>
            {((frequency === 'weekly' && payDays.length < 4) || 
              (frequency === 'biweekly' && payDays.length < 2) ||
              (frequency === 'monthly' && payDays.length < 3)) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPayDay}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="grid gap-3">
            {payDays.map((day, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="number"
                  value={day}
                  onChange={(e) => updatePayDay(index, e.target.value)}
                  placeholder={
                    frequency === 'weekly' ? 'Day of week (1-7)' :
                    frequency === 'yearly' ? 'Day of year (1-365)' :
                    'Day of month (1-31)'
                  }
                  min="1"
                  max={frequency === 'weekly' ? '7' : frequency === 'yearly' ? '365' : '31'}
                  className={errors[`payDay-${index}`] ? 'border-destructive' : ''}
                />
                {((frequency === 'weekly' && payDays.length > 1) ||
                  (frequency === 'biweekly' && payDays.length > 1) ||
                  (frequency === 'monthly' && payDays.length > 1) ||
                  (frequency === 'yearly' && payDays.length > 1)) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayDay(index)}
                    className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {errors.payDays && <p className="text-sm text-destructive">{errors.payDays}</p>}
          {Object.keys(errors).filter(k => k.startsWith('payDay-')).map(key => (
            <p key={key} className="text-sm text-destructive">{errors[key]}</p>
          ))}
        </div>

        {/* Quarterly Amounts */}
        <div className="space-y-3">
          <Label>💰 Salary amount per paycheck</Label>
          <div className="grid grid-cols-2 gap-4">
            {quarterlyAmounts.map((q) => (
              <Card key={q.quarter} className="p-3 space-y-2">
                <Label className="text-sm font-medium">{q.quarter}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={q.amount}
                    onChange={(e) => updateQuarterlyAmount(q.quarter, e.target.value)}
                    placeholder="0.00"
                    className={`pl-8 ${errors[`amount-${q.quarter}`] ? 'border-destructive' : ''}`}
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors[`amount-${q.quarter}`] && (
                  <p className="text-xs text-destructive">{errors[`amount-${q.quarter}`]}</p>
                )}
              </Card>
            ))}
          </div>
          
          {errors.amounts && <p className="text-sm text-destructive">{errors.amounts}</p>}
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Fill in different amounts if your salary varies by quarter. Leave empty quarters at $0.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip for now
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default SalaryStep;