
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import CurrencyDisplay from './CurrencyDisplay';

interface EmergencyBorrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmergencyBorrowModal = ({ open, onOpenChange }: EmergencyBorrowModalProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { getNextIncomeAmount, addTransaction } = useFinancial();
  const { toast } = useToast();

  const maxBorrowAmount = Math.floor(getNextIncomeAmount() * 0.5); // Max 50% of next income
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxBorrowAmount;

  const handleBorrow = () => {
    if (isValidAmount) {
      addTransaction({
        type: 'borrow',
        amount: parseFloat(amount),
        description: reason || 'Emergency advance',
        date: new Date().toISOString().split('T')[0],
        category: 'advance'
      });
      
      toast({
        title: "Advance Approved! 💰",
        description: `$${parseFloat(amount).toLocaleString()} added to your available balance`,
      });
      
      setAmount('');
      setReason('');
      onOpenChange(false);
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
              Borrow a small amount from your next programmed income. This will reduce your next paycheck accordingly.
            </p>
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
              Maximum: <CurrencyDisplay amount={maxBorrowAmount} className="inline" /> (50% of next income)
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

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Next Income:</span>
              <span className="font-medium"><CurrencyDisplay amount={getNextIncomeAmount()} className="inline" /></span>
            </div>
            <div className="flex justify-between text-sm">
              <span>After Borrowing:</span>
              <span className="font-medium">
                <CurrencyDisplay amount={getNextIncomeAmount() - (parseFloat(amount) || 0)} className="inline" />
              </span>
            </div>
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
