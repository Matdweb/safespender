
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';

interface ExpensesStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const ExpensesStep = ({ data, onNext, onBack }: ExpensesStepProps) => {
  const [expenses, setExpenses] = useState(data.expenses || []);
  const [currentExpense, setCurrentExpense] = useState({
    description: '',
    amount: '',
    category: '',
    dayOfMonth: ''
  });

  const categories = [
    { value: 'housing', label: '🏠 Housing', emoji: '🏠' },
    { value: 'utilities', label: '⚡ Utilities', emoji: '⚡' },
    { value: 'food', label: '🍕 Food', emoji: '🍕' },
    { value: 'transportation', label: '🚗 Transportation', emoji: '🚗' },
    { value: 'healthcare', label: '🏥 Healthcare', emoji: '🏥' },
    { value: 'entertainment', label: '🎬 Entertainment', emoji: '🎬' },
    { value: 'subscriptions', label: '📱 Subscriptions', emoji: '📱' },
    { value: 'other', label: '📦 Other', emoji: '📦' }
  ];

  const addExpense = () => {
    if (currentExpense.description && currentExpense.amount && currentExpense.category) {
      const newExpense = {
        description: currentExpense.description,
        amount: parseFloat(currentExpense.amount),
        category: currentExpense.category,
        recurring: {
          type: 'monthly' as const,
          interval: 1
        },
        dayOfMonth: currentExpense.dayOfMonth ? parseInt(currentExpense.dayOfMonth) : undefined
      };
      
      setExpenses([...expenses, newExpense]);
      setCurrentExpense({ description: '', amount: '', category: '', dayOfMonth: '' });
    }
  };

  const removeExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const getCategoryEmoji = (category: string) => {
    return categories.find(cat => cat.value === category)?.emoji || '📦';
  };

  const handleNext = () => {
    onNext({ expenses });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🧾</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Any bills coming soon?
          </h2>
          <p className="text-muted-foreground">
            Add your regular expenses so we can calculate your free-to-spend amount
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Add an expense</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="expense-desc">What's this expense?</Label>
              <Input
                id="expense-desc"
                value={currentExpense.description}
                onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                placeholder="e.g., Rent, Gym membership, Netflix"
              />
            </div>

            <div>
              <Label htmlFor="expense-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="expense-amount"
                  type="number"
                  value={currentExpense.amount}
                  onChange={(e) => setCurrentExpense({...currentExpense, amount: e.target.value})}
                  placeholder="0.00"
                  className="pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expense-category">Category</Label>
              <Select 
                value={currentExpense.category} 
                onValueChange={(value) => setCurrentExpense({...currentExpense, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expense-day">Day of month (optional)</Label>
              <Input
                id="expense-day"
                type="number"
                value={currentExpense.dayOfMonth}
                onChange={(e) => setCurrentExpense({...currentExpense, dayOfMonth: e.target.value})}
                placeholder="e.g., 1st, 15th"
                min="1"
                max="31"
              />
            </div>

            <Button 
              onClick={addExpense}
              disabled={!currentExpense.description || !currentExpense.amount || !currentExpense.category}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </Card>

        {expenses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Your expenses:</h3>
            {expenses.map((expense, index) => (
              <Card key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getCategoryEmoji(expense.category)}</span>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      ${expense.amount.toLocaleString()} monthly
                      {expense.dayOfMonth && ` • ${expense.dayOfMonth}${expense.dayOfMonth === 1 ? 'st' : expense.dayOfMonth === 2 ? 'nd' : expense.dayOfMonth === 3 ? 'rd' : 'th'} of month`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpense(index)}
                  className="p-1 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ExpensesStep;
