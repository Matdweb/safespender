import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp } from 'lucide-react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    amount: number;
    date: string;
    category: string;
    description: string;
    isRecurring: boolean;
    isReserved: boolean;
    recurring?: {
      type: 'weekly' | 'monthly' | 'biweekly';
      interval: number;
      endDate?: string;
      dayOfMonth?: number;
      occurrencesPerMonth?: number;
      daysOfMonth?: number[];
    };
  }) => void;
}

const AddExpenseDialog = ({ open, onOpenChange, onAddExpense }: AddExpenseDialogProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [recurringType, setRecurringType] = useState<'weekly' | 'monthly' | 'biweekly'>('monthly');

  const categories = [
    'Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Subscriptions', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0 || !category) return;

    // Ensure date is properly formatted (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const expenseData = {
      amount: parseFloat(amount),
      date: formattedDate,
      category,
      description: description || category,
      isRecurring,
      isReserved,
      ...(isRecurring && {
        recurring: {
          type: recurringType,
          interval: 1,
          dayOfMonth: new Date(formattedDate).getDate()
        }
      })
    };

    onAddExpense(expenseData);

    // Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setDescription('');
    setIsRecurring(false);
    setIsReserved(false);
    setRecurringType('monthly');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg w-full px-4 py-6 sm:px-6 sm:py-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-destructive/5 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
            </div>
            💳 Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Rent, Groceries, Gas"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurring" 
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="text-sm">Recurring expense</Label>
            </div>

            {isRecurring && (
              <div className="ml-6 space-y-2">
                <Label>Frequency</Label>
                <Select value={recurringType} onValueChange={(value: 'weekly' | 'monthly' | 'biweekly') => setRecurringType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reserved" 
                checked={isReserved}
                onCheckedChange={(checked) => setIsReserved(checked as boolean)}
              />
              <Label htmlFor="reserved" className="text-sm">
                Reserve from free-to-spend now
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-neutral-700 hover:bg-neutral-800 text-white dark:bg-neutral-600 dark:hover:bg-neutral-700">
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
