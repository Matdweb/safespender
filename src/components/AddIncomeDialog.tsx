
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign } from 'lucide-react';

interface AddIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIncome: (income: {
    amount: number;
    date: string;
    frequency: string;
    allocation: string;
    description: string;
  }) => void;
}

const AddIncomeDialog = ({ open, onOpenChange, onAddIncome }: AddIncomeDialogProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('one-time');
  const [allocation, setAllocation] = useState('free-spend');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) return;

    onAddIncome({
      amount: parseFloat(amount),
      date,
      frequency,
      allocation,
      description: description || 'Income'
    });

    // Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setFrequency('one-time');
    setAllocation('free-spend');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-finance-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-finance-primary" />
            </div>
            Add Income
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Freelance payment, Salary"
            />
          </div>

          <div className="space-y-3">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Allocate to</Label>
            <RadioGroup value={allocation} onValueChange={setAllocation}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free-spend" id="free-spend" />
                <Label htmlFor="free-spend" className="text-sm">Free to spend</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="savings" id="savings" />
                <Label htmlFor="savings" className="text-sm">Savings goals</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed" className="text-sm">Split between both</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-finance-primary hover:bg-finance-primary-dark">
              Add Income
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomeDialog;
