import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingDown, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UnifiedExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: {
    title: string;
    category: string;
    amount: number;
    type: 'one-time' | 'monthly';
    date?: string; // YYYY-MM-DD for one-time
    day_of_month?: number; // 1-31 for monthly
  }) => void;
  initialDate?: Date;
}

const EXPENSE_CATEGORIES = [
  { emoji: '🏠', label: 'Housing', value: 'housing' },
  { emoji: '🍕', label: 'Food', value: 'food' },
  { emoji: '🚗', label: 'Transportation', value: 'transportation' },
  { emoji: '⚡', label: 'Utilities', value: 'utilities' },
  { emoji: '🏥', label: 'Healthcare', value: 'healthcare' },
  { emoji: '🎬', label: 'Entertainment', value: 'entertainment' },
  { emoji: '🛍️', label: 'Shopping', value: 'shopping' },
  { emoji: '📱', label: 'Subscriptions', value: 'subscriptions' },
  { emoji: '💼', label: 'Business', value: 'business' },
  { emoji: '📚', label: 'Education', value: 'education' },
  { emoji: '❓', label: 'Other', value: 'other' },
];

const UnifiedExpenseDialog = ({ 
  open, 
  onOpenChange, 
  onAddExpense, 
  initialDate 
}: UnifiedExpenseDialogProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setAmount('');
    setExpenseType('one-time');
    setSelectedDate(initialDate || new Date());
    setDayOfMonth('');
    setShowDatePicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !amount || parseFloat(amount) <= 0) return;

    const expenseData: Parameters<typeof onAddExpense>[0] = {
      title,
      category,
      amount: parseFloat(amount),
      type: expenseType,
    };

    if (expenseType === 'one-time') {
      if (!selectedDate) return;
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      expenseData.date = `${year}-${month}-${day}`;
    } else {
      const dayNum = parseInt(dayOfMonth);
      if (!dayOfMonth || dayNum < 1 || dayNum > 31) return;
      expenseData.day_of_month = dayNum;
    }

    onAddExpense(expenseData);
    resetForm();
    onOpenChange(false);
  };

  const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.value === category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg w-full px-4 py-6 sm:px-6 sm:py-8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-destructive/5 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            💳 Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Expense Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rent, Gym Membership, Groceries"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category">
                  {selectedCategory && (
                    <span className="flex items-center gap-2">
                      <span>{selectedCategory.emoji}</span>
                      <span>{selectedCategory.label}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
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

          {/* Expense Type */}
          <div className="space-y-3">
            <Label>Frequency</Label>
            <RadioGroup 
              value={expenseType} 
              onValueChange={(value) => setExpenseType(value as 'one-time' | 'monthly')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                  <div className="font-medium">One-time</div>
                  <div className="text-sm text-muted-foreground">Specific date</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <div className="font-medium">Monthly</div>
                  <div className="text-sm text-muted-foreground">Recurring</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          {expenseType === 'one-time' && (
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setShowDatePicker(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Day of Month Selection */}
          {expenseType === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
              <Input
                id="dayOfMonth"
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="e.g., 15 for the 15th of every month"
                min="1"
                max="31"
                required
              />
              <p className="text-xs text-muted-foreground">
                Note: If you pick day 30 or 31, it will fall back to the 28th in February
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedExpenseDialog;