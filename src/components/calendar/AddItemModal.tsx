
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarItem } from '@/types/calendar';
import { DollarSign, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onAddItem: (item: Omit<CalendarItem, 'id'>) => void;
}

const AddItemModal = ({ open, onOpenChange, selectedDate, onAddItem }: AddItemModalProps) => {
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const resetForm = () => {
    setType('expense');
    setTitle('');
    setAmount('');
    setCategory('');
    setDescription('');
    setCustomDate(undefined);
    setShowDatePicker(false);
  };

  // Helper function to format date properly without timezone issues
  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount) return;
    
    const targetDate = customDate || selectedDate;
    if (!targetDate) return;

    const item: Omit<CalendarItem, 'id'> = {
      type,
      title,
      amount: parseFloat(amount),
      date: formatDateForStorage(targetDate),
      category: category || undefined,
      description: description || undefined,
    };

    onAddItem(item);
    
    resetForm();
    onOpenChange(false);
  };

  const typeOptions = [
    { value: 'income', label: 'Income', icon: DollarSign, color: 'text-primary' },
    { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'text-destructive' },
    { value: 'savings', label: 'Savings', icon: DollarSign, color: 'text-blue-600' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Financial Item
            {selectedDate && (
              <span className="block text-sm text-muted-foreground font-normal mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map(option => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={type === option.value ? "default" : "outline"}
                    className="flex flex-col gap-2 h-auto py-3"
                    onClick={() => setType(option.value as any)}
                  >
                    <Icon className={`w-4 h-4 ${type === option.value ? 'text-primary-foreground' : option.color}`} />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rent, Salary, Groceries"
              required
            />
          </div>

          {/* Date Picker for Programming */}
          <div className="space-y-2">
            <Label>Scheduled For</Label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !customDate && !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDate ? format(customDate, "PPP") : 
                   selectedDate ? format(selectedDate, "PPP") : 
                   <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDate || selectedDate || undefined}
                  onSelect={(date) => {
                    setCustomDate(date);
                    setShowDatePicker(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Housing, Food, Entertainment"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 This adds a one-time transaction. For recurring income, use "Set Salary" in your settings.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add {typeOptions.find(opt => opt.value === type)?.label}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
