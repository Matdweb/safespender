import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
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
    date?: string;
    day_of_month?: number;
  }) => void;
  initialDate?: Date;
}

const EXPENSE_CATEGORIES = [
  { emoji: '🏠', label: 'Housing', value: 'housing' },
  { emoji: '🍔', label: 'Food & Dining', value: 'food' },
  { emoji: '🚗', label: 'Transportation', value: 'transportation' },
  { emoji: '🎬', label: 'Entertainment', value: 'entertainment' },
  { emoji: '🏥', label: 'Healthcare', value: 'healthcare' },
  { emoji: '👕', label: 'Shopping', value: 'shopping' },
  { emoji: '💳', label: 'Bills & Utilities', value: 'utilities' },
  { emoji: '🎓', label: 'Education', value: 'education' },
  { emoji: '💼', label: 'Business', value: 'business' },
  { emoji: '🏋️', label: 'Fitness & Health', value: 'fitness' },
  { emoji: '✈️', label: 'Travel', value: 'travel' },
  { emoji: '🎁', label: 'Gifts & Donations', value: 'gifts' },
  { emoji: '💰', label: 'Savings & Investments', value: 'savings' },
  { emoji: '📱', label: 'Subscriptions', value: 'subscriptions' },
  { emoji: '📝', label: 'Other', value: 'other' },
];

const UnifiedExpenseDialog = ({ open, onOpenChange, onAddExpense, initialDate }: UnifiedExpenseDialogProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setAmount('');
    setExpenseType('one-time');
    setSelectedDate(initialDate);
    setDayOfMonth('');
    setShowDatePicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !category) return;
    
    const expenseData = {
      title,
      category,
      amount: parseFloat(amount),
      type: expenseType,
      ...(expenseType === 'one-time' 
        ? { date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0] }
        : { day_of_month: parseInt(dayOfMonth) }
      )
    };

    onAddExpense(expenseData);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>💳 Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rent, Groceries, Gas"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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

          <div className="space-y-3">
            <Label>Expense Type</Label>
            <RadioGroup value={expenseType} onValueChange={(value: 'one-time' | 'monthly') => setExpenseType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">One-time expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly recurring</Label>
              </div>
            </RadioGroup>
          </div>

          {expenseType === 'one-time' ? (
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
          ) : (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
              <Input
                id="dayOfMonth"
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="e.g., 15"
                min="1"
                max="31"
                required
              />
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