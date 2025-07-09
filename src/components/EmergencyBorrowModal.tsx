
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { useCreateTransaction } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import CurrencyDisplay from './CurrencyDisplay';

interface EmergencyBorrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmergencyBorrowModal = ({ open, onOpenChange }: EmergencyBorrowModalProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { 
    nextIncomeAmount, 
    nextIncomeDate, 
    pendingExpenses,
    goals
  } = useFinancialDashboard();
  const createTransactionMutation = useCreateTransaction();
  const { toast } = useToast();
  
  // Calculate upcoming savings until next income
  const upcomingSavings = goals
    ?.filter(goal => goal.recurring_contribution && parseFloat(goal.recurring_contribution.toString()) > 0)
    .reduce((sum, goal) => {
      if (!nextIncomeDate) return sum;
      const today = new Date();
      const daysBetween = Math.ceil((nextIncomeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let contributions = 0;
      switch (goal.contribution_frequency) {
        case 'weekly':
          contributions = Math.floor(daysBetween / 7);
          break;
        case 'biweekly':
          contributions = Math.floor(daysBetween / 14);
          break;
        case 'monthly':
          contributions = Math.floor(daysBetween / 30);
          break;
      }
      
      return sum + (contributions * parseFloat(goal.recurring_contribution.toString()));
    }, 0) || 0;

  const availableAfterObligations = Math.max(0, nextIncomeAmount - pendingExpenses - upcomingSavings);
  const maxBorrowAmount = Math.floor(availableAfterObligations * 0.8); // Max 80% of available amount
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxBorrowAmount;

  const handleBorrow = async () => {
    if (isValidAmount) {
      try {
        await createTransactionMutation.mutateAsync({
          type: 'income',
          amount: parseFloat(amount),
          description: reason || 'Emergency advance',
          date: new Date().toISOString().split('T')[0],
          category: 'advance',
        });
        
        toast({
          title: "Advance Approved! 💰",
          description: `$${parseFloat(amount).toLocaleString()} added to your available balance`,
        });
        
        setAmount('');
        setReason('');
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process advance",
          variant: "destructive"
        });
      }
    }
  };

  const reasonOptions = [
    'Emergency',
    'Groceries',
    'Medical',
    'Transportation',
    'Utilities',
    'Other'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            I Need More Money
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Borrow a small amount from your next programmed salary. This will reduce your next paycheck accordingly.
            </p>
            {nextIncomeDate && (
              <p className="text-xs text-orange-600 dark:text-orange-300 mt-2">
                Next salary: {nextIncomeDate.toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow-amount">Amount to Borrow</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                max={maxBorrowAmount}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: <CurrencyDisplay amount={maxBorrowAmount} className="inline" /> (available after obligations)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow-reason">Reason (Optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Next Salary:</span>
              <span className="font-medium"><CurrencyDisplay amount={nextIncomeAmount} className="inline" /></span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>- Upcoming Bills:</span>
              <span><CurrencyDisplay amount={pendingExpenses} className="inline" /></span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>- Upcoming Savings:</span>
              <span><CurrencyDisplay amount={upcomingSavings} className="inline" /></span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-medium">
              <span>Available to Borrow:</span>
              <span><CurrencyDisplay amount={availableAfterObligations} className="inline" /></span>
            </div>
            {parseFloat(amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span>After Borrowing:</span>
                <span className="font-medium">
                  <CurrencyDisplay amount={availableAfterObligations - (parseFloat(amount) || 0)} className="inline" />
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleBorrow} 
              disabled={!isValidAmount}
              className="flex-1"
            >
              Borrow <CurrencyDisplay amount={parseFloat(amount) || 0} className="inline ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyBorrowModal;
