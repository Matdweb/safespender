import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Settings, Plus, X } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

interface QuarterlyAmount {
  quarter: string;
  amount: string;
}

interface SetSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetSalary: (salary: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    daysOfMonth: number[];
    quarterlyAmounts: { quarter: string; amount: number }[];
  }) => void;
  currentSalary?: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    daysOfMonth: number[];
    quarterlyAmounts: { quarter: string; amount: number }[];
  } | null;
}

const SetSalaryModal = ({ open, onOpenChange, onSetSalary, currentSalary }: SetSalaryModalProps) => {
  const { setStartDate, startDate } = useFinancial();
  const [frequency, setFrequency] = useState(currentSalary?.frequency || 'biweekly');
  const [payDays, setPayDays] = useState<string[]>(
    currentSalary?.daysOfMonth?.map(d => d.toString()) || ['15', '30']
  );
  const [quarterlyAmounts, setQuarterlyAmounts] = useState<QuarterlyAmount[]>(
    currentSalary?.quarterlyAmounts?.map(q => ({ quarter: q.quarter, amount: q.amount.toString() })) || [
      { quarter: 'Q1', amount: '' },
      { quarter: 'Q2', amount: '' },
      { quarter: 'Q3', amount: '' },
      { quarter: 'Q4', amount: '' }
    ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPayDay = () => {
    if (payDays.length < 3) {
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
      if (!day || isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        newErrors[`payDay-${index}`] = 'Enter a valid day (1-31)';
      }
    });

    // Check for duplicate pay days
    const uniqueDays = new Set(payDays.filter(d => d && !isNaN(parseInt(d))));
    if (uniqueDays.size !== payDays.filter(d => d).length) {
      newErrors.payDays = 'Pay days must be unique';
    }

    // Validate quarterly amounts
    quarterlyAmounts.forEach(q => {
      if (!q.amount || parseFloat(q.amount) <= 0) {
        newErrors[`amount-${q.quarter}`] = 'Enter a valid amount';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // If this is the first time setting salary and no start date exists, set it to today
      if (!currentSalary && !startDate) {
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
      }

      onSetSalary({
        frequency,
        daysOfMonth: payDays.map(d => parseInt(d)).filter(d => !isNaN(d)),
        quarterlyAmounts: quarterlyAmounts.map(q => ({
          quarter: q.quarter,
          amount: parseFloat(q.amount)
        }))
      });
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFrequency('biweekly');
    setPayDays(['15', '30']);
    setQuarterlyAmounts([
      { quarter: 'Q1', amount: '' },
      { quarter: 'Q2', amount: '' },
      { quarter: 'Q3', amount: '' },
      { quarter: 'Q4', amount: '' }
    ]);
    setErrors({});
  };

  useEffect(() => {
    switch (frequency) {
      case 'biweekly':
        setQuarterlyAmounts([
          { quarter: 'First Paycheck', amount: '' },
          { quarter: 'Second Paycheck', amount: '' }
        ]);
        break;
      case 'monthly':
      case 'yearly':
        setQuarterlyAmounts([
          { quarter: 'Paycheck', amount: '' }
        ]);
        break;
      default: // weekly or fallback to quarterly setup
        setQuarterlyAmounts([
          { quarter: 'Q1', amount: '' },
          { quarter: 'Q2', amount: '' },
          { quarter: 'Q3', amount: '' },
          { quarter: 'Q4', amount: '' }
        ]);
        break;
    }
  }, [frequency]);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            Set Salary Configuration
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label>💼 How often are you paid per year?</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
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

          {/* Pay Days Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>📅 Which days of the month are you paid?</Label>
              {payDays.length < 3 && (
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
                    placeholder="Day of month (1-31)"
                    min="1"
                    max="31"
                    className={errors[`payDay-${index}`] ? 'border-destructive' : ''}
                  />
                  {payDays.length > 1 && (
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

            <p className="text-xs text-muted-foreground">
              💡 Examples: 15 & 30 for mid-month and end-month, or just 1 for start of month
            </p>
          </div>

          {/* Quarterly Amounts */}
          <div className="space-y-3">
            <Label>
              💰 Salary amount per paycheck ({frequency === 'biweekly' ? 'per period' : frequency === 'monthly' ? 'monthly' : frequency === 'yearly' ? 'yearly' : 'quarterly'})
            </Label>

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
            <p className="text-xs text-muted-foreground">
              💡 Set different amounts if your salary varies by quarter. All quarters use the same pay schedule.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {currentSalary ? 'Update' : 'Set'} Salary
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetSalaryModal;
