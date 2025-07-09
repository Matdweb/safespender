
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Settings, Plus, X } from 'lucide-react';
import { useCreateSalaryConfiguration, useUpdateSalaryConfiguration, useSalaryConfiguration } from '@/hooks/useFinancialData';
import { toast } from 'sonner';

interface QuarterlyAmount {
  quarter: string;
  amount: string;
}

interface SetSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetSalary?: (salary: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    daysOfMonth: number[];
    quarterlyAmounts: { quarter: string; amount: number }[];
  }) => void;
}

const SetSalaryModal = ({ open, onOpenChange, onSetSalary }: SetSalaryModalProps) => {
  const { data: currentSalary, isLoading: isLoadingSalary } = useSalaryConfiguration();
  const createSalaryMutation = useCreateSalaryConfiguration();
  const updateSalaryMutation = useUpdateSalaryConfiguration();
  
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'yearly'>('biweekly');
  const [payDays, setPayDays] = useState<string[]>(['15', '30']);
  const [quarterlyAmounts, setQuarterlyAmounts] = useState<QuarterlyAmount[]>([
    { quarter: 'Q1', amount: '' },
    { quarter: 'Q2', amount: '' },
    { quarter: 'Q3', amount: '' },
    { quarter: 'Q4', amount: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with current salary data
  useEffect(() => {
    if (currentSalary) {
      setFrequency(currentSalary.frequency as 'weekly' | 'biweekly' | 'monthly' | 'yearly');
      setPayDays(currentSalary.days_of_month?.map(d => d.toString()) || ['15']);
      
      // Handle quarterly amounts - they come as JSONB from database
      if (currentSalary.quarterly_amounts) {
        const amounts = Array.isArray(currentSalary.quarterly_amounts) 
          ? currentSalary.quarterly_amounts 
          : [];
        
        setQuarterlyAmounts(amounts.map((q: any) => ({
          quarter: q.quarter || 'Q1',
          amount: q.amount?.toString() || ''
        })));
      }
    }
  }, [currentSalary]);

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

    // Validate quarterly amounts
    quarterlyAmounts.forEach(q => {
      if (!q.amount || parseFloat(q.amount) <= 0) {
        newErrors[`amount-${q.quarter}`] = 'Enter a valid amount';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const salaryData = {
      frequency,
      days_of_month: payDays.map(d => parseInt(d)).filter(d => !isNaN(d)),
      quarterly_amounts: quarterlyAmounts.map(q => ({
        quarter: q.quarter,
        amount: parseFloat(q.amount)
      }))
    };

    try {
      if (currentSalary) {
        await updateSalaryMutation.mutateAsync(salaryData);
        toast.success('Salary configuration updated successfully!');
      } else {
        await createSalaryMutation.mutateAsync(salaryData);
        toast.success('Salary configuration created successfully!');
      }
      
      if (onSetSalary) {
        onSetSalary(salaryData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error('Failed to save salary configuration');
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
    // Update quarterlyAmounts based on frequency
    switch (frequency) {
      case 'biweekly':
        setQuarterlyAmounts([
          { quarter: 'First Paycheck', amount: quarterlyAmounts[0]?.amount || '' },
          { quarter: 'Second Paycheck', amount: quarterlyAmounts[1]?.amount || '' }
        ]);
        break;
      case 'monthly':
        setQuarterlyAmounts([
          { quarter: 'Monthly Pay', amount: quarterlyAmounts[0]?.amount || '' }
        ]);
        break;
      case 'yearly':
        setQuarterlyAmounts([
          { quarter: 'Annual Salary', amount: quarterlyAmounts[0]?.amount || '' }
        ]);
        break;
      case 'weekly':
        setQuarterlyAmounts([
          { quarter: 'Weekly Pay', amount: quarterlyAmounts[0]?.amount || '' }
        ]);
        break;
      default:
        setQuarterlyAmounts([
          { quarter: 'Pay Amount', amount: quarterlyAmounts[0]?.amount || '' }
        ]);
        break;
    }

    // Dynamically update payDays based on frequency only if no current salary
    if (!currentSalary) {
      switch (frequency) {
        case 'weekly':
          setPayDays(['5']);
          break;
        case 'biweekly':
          setPayDays(['15', '30']);
          break;
        case 'monthly':
          setPayDays(['15']);
          break;
        case 'yearly':
          setPayDays(['1']);
          break;
        default:
          setPayDays(['15']);
      }
    }
  }, [frequency, currentSalary]);

  const isLoading = createSalaryMutation.isPending || updateSalaryMutation.isPending || isLoadingSalary;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg w-full px-4 py-6 sm:px-6 sm:py-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            💼 {currentSalary ? 'Update' : 'Set'} Salary Configuration
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
              💡 {frequency === 'weekly' ? 'Examples: 5 for Friday, 1 for Monday' :
                  frequency === 'yearly' ? 'Examples: 1 for January 1st, 365 for December 31st' :
                  'Examples: 15 & 30 for mid-month and end-month, or just 1 for start of month'}
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : currentSalary ? 'Update' : 'Set'} Salary
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetSalaryModal;
