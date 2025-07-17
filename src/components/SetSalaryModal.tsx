import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Settings, Plus, X } from 'lucide-react';
import { useSalary, useCreateSalary, useUpdateSalary } from '@/hooks/useSalary';
import { toast } from 'sonner';

interface SetSalaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SetSalaryModal = ({ open, onOpenChange }: SetSalaryModalProps) => {
  const { data: currentSalary, isLoading: isLoadingSalary } = useSalary();
  const createSalaryMutation = useCreateSalary();
  const updateSalaryMutation = useUpdateSalary();
  
  const [schedule, setSchedule] = useState<'monthly' | 'biweekly' | 'yearly'>('monthly');
  const [payDates, setPayDates] = useState<string[]>(['15']);
  const [paychecks, setPaychecks] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with current salary data
  useEffect(() => {
    if (currentSalary) {
      console.log('Fetched salary:', currentSalary);
      setSchedule(currentSalary.schedule);
      setPayDates(currentSalary.pay_dates.map(d => d.toString()));
      setPaychecks(currentSalary.paychecks.map(p => p.toString()));
    }
  }, [currentSalary]);

  // Update fields when schedule changes
  useEffect(() => {
    if (!currentSalary) {
      switch (schedule) {
        case 'monthly':
          setPayDates(['15']);
          setPaychecks(['']);
          break;
        case 'biweekly':
          setPayDates(['15', '30']);
          setPaychecks(['', '']);
          break;
        case 'yearly':
          setPayDates(['1']);
          setPaychecks(['']);
          break;
      }
    }
  }, [schedule, currentSalary]);

  const addPayDate = () => {
    const maxDates = schedule === 'biweekly' ? 2 : schedule === 'monthly' ? 3 : 1;
    if (payDates.length < maxDates) {
      setPayDates([...payDates, '']);
      setPaychecks([...paychecks, '']);
    }
  };

  const removePayDate = (index: number) => {
    if (payDates.length > 1) {
      setPayDates(payDates.filter((_, i) => i !== index));
      setPaychecks(paychecks.filter((_, i) => i !== index));
    }
  };

  const updatePayDate = (index: number, value: string) => {
    const newPayDates = [...payDates];
    newPayDates[index] = value;
    setPayDates(newPayDates);
  };

  const updatePaycheck = (index: number, value: string) => {
    const newPaychecks = [...paychecks];
    newPaychecks[index] = value;
    setPaychecks(newPaychecks);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate pay dates
    payDates.forEach((date, index) => {
      const dateNum = parseInt(date);
      if (!date || isNaN(dateNum) || dateNum < 1 || dateNum > 31) {
        newErrors[`payDate-${index}`] = 'Enter a valid day (1-31)';
      }
    });

    // Check for duplicate pay dates
    const uniqueDates = new Set(payDates.filter(d => d && !isNaN(parseInt(d))));
    if (uniqueDates.size !== payDates.filter(d => d).length) {
      newErrors.payDates = 'Pay dates must be unique';
    }

    // Validate paychecks
    paychecks.forEach((paycheck, index) => {
      const amount = parseFloat(paycheck);
      if (!paycheck || isNaN(amount) || amount <= 0) {
        newErrors[`paycheck-${index}`] = 'Enter a valid amount';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payDatesNumbers = payDates.map(d => parseInt(d)).filter(d => !isNaN(d));
    const paychecksNumbers = paychecks.map(p => parseFloat(p)).filter(p => !isNaN(p));

    const salaryData = {
      schedule,
      pay_dates: payDatesNumbers,
      paychecks: paychecksNumbers
    };

    try {
      if (currentSalary) {
        await updateSalaryMutation.mutateAsync(salaryData);
        toast.success('Salary updated successfully!');
      } else {
        await createSalaryMutation.mutateAsync(salaryData);
        toast.success('Salary created successfully!');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving salary:', error);
      toast.error('Failed to save salary configuration');
    }
  };

  const resetForm = () => {
    setSchedule('monthly');
    setPayDates(['15']);
    setPaychecks(['']);
    setErrors({});
  };

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
            {currentSalary ? 'Update' : 'Set'} Salary
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Selection */}
          <div className="space-y-3">
            <Label>How often are you paid?</Label>
            <Select value={schedule} onValueChange={(value: any) => setSchedule(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pay Dates Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Dates of payment within each month</Label>
              {((schedule === 'monthly' && payDates.length < 3) || 
                (schedule === 'biweekly' && payDates.length < 2)) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPayDate}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-3">
              {payDates.map((date, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="number"
                    value={date}
                    onChange={(e) => updatePayDate(index, e.target.value)}
                    placeholder="Day of month (1-31)"
                    min="1"
                    max="31"
                    className={errors[`payDate-${index}`] ? 'border-destructive' : ''}
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
  <Input
    type="number"
    value={paychecks[index]}
    onChange={(e) => updatePaycheck(index, e.target.value)}
    placeholder="Amount"
    className={`pl-8 py-3 text-base font-semibold text-right w-full ${errors[`paycheck-${index}`] ? 'border-destructive' : ''}`}
    step="0.01"
    min="0"
  />
</div>


                  </div>
                  {payDates.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePayDate(index)}
                      className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.payDates && <p className="text-sm text-destructive">{errors.payDates}</p>}
            {Object.keys(errors).filter(k => k.startsWith('payDate-') || k.startsWith('paycheck-')).map(key => (
              <p key={key} className="text-sm text-destructive">{errors[key]}</p>
            ))}

            <p className="text-xs text-muted-foreground">
              Example: 15, 30 for mid-month and end-month payments
            </p>
          </div>

          {/* Tip */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 If your income is inconsistent, you can skip this and add incomes manually as they come.
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