import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useExpenseManager } from '@/hooks/useExpenseManager';
import { useSavingsGoals, useTransactions } from '@/hooks/useFinancialData';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense' | 'savings';
  defaultDate?: Date;
  title: string;
}

const UnifiedTransactionModal = ({ 
  open, 
  onOpenChange, 
  type, 
  defaultDate, 
  title 
}: UnifiedTransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { addExpense } = useExpenseManager();
  const { data: goals } = useSavingsGoals();
  const { refetch: refetchTransactions } = useTransactions();

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(defaultDate || new Date());
    setSelectedGoalId('');
    setIsRecurring(false);
    setRecurringType('monthly');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to add transactions',
          variant: 'destructive',
        });
        return;
      }
      
      if (type === 'income') {
        // Create income transaction
        await supabase.from('transactions').insert({
          amount: parsedAmount,
          description,
          date: format(date, 'yyyy-MM-dd'),
          category: category || 'income',
          type: 'income',
          user_id: user.id,
        });
      } else if (type === 'expense') {
        await addExpense({
          amount: parsedAmount,
          category: category || 'general',
          date: format(date, 'yyyy-MM-dd'),
          isRecurring,
          recurringType: isRecurring ? recurringType : undefined,
        });
      } else if (type === 'savings') {
        if (!selectedGoalId) {
          toast({
            title: 'Error',
            description: 'Please select a savings goal',
            variant: 'destructive',
          });
          return;
        }
        
        // Create savings transaction
        await supabase.from('transactions').insert({
          amount: parsedAmount,
          description,
          date: format(date, 'yyyy-MM-dd'),
          category: 'savings',
          type: 'savings',
          goal_id: selectedGoalId,
          user_id: user.id,
        });
      }

      // Refetch transactions to update the UI
      await refetchTransactions();

      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast({
        title: 'Error',
        description: `Failed to add ${type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryOptions = () => {
    if (type === 'income') {
      return ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
    } else if (type === 'expense') {
      return ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other'];
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder={`Enter ${type} description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {type === 'savings' && (
            <div className="space-y-2">
              <Label htmlFor="goal">Savings Goal *</Label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a savings goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals?.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.icon} {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type !== 'savings' && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions().map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'expense' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <Label htmlFor="recurring">Make this a recurring expense</Label>
              </div>
              
              {isRecurring && (
                <Select value={recurringType} onValueChange={setRecurringType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedTransactionModal;