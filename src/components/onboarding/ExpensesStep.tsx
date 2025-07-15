import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import UnifiedExpenseDialog from '@/components/UnifiedExpenseDialog';
import { OnboardingData } from './OnboardingFlow';
import { TrendingDown, Plus } from 'lucide-react';
import { useExpenseManager } from '@/hooks/useExpenseManager';

interface ExpensesStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack?: () => void;
}

const ExpensesStep = ({ data, onNext, onBack }: ExpensesStepProps) => {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [addedExpenses, setAddedExpenses] = useState<string[]>([]);
  const { addExpense } = useExpenseManager();

  const handleAddExpense = async (expense: {
    title: string;
    category: string;
    amount: number;
    type: 'one-time' | 'monthly';
    date?: string;
    day_of_month?: number;
  }) => {
    try {
      await addExpense(expense);
      setAddedExpenses(prev => [...prev, `${expense.title} - $${expense.amount.toLocaleString()}`]);
      setShowExpenseDialog(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleNext = () => {
    onNext({});
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <TrendingDown className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Add Programmed Expenses</h2>
        <p className="text-muted-foreground">
          Add your regular monthly expenses so SafeSpender can calculate your available money accurately.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Add expenses like rent, utilities, subscriptions, and other monthly bills.
            </p>
            <Button
              onClick={() => setShowExpenseDialog(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Monthly Expense
            </Button>
          </div>

          {addedExpenses.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-green-600">Added Expenses:</h3>
              {addedExpenses.map((expense, index) => (
                <Card key={index} className="p-3 bg-green-50 border-green-200">
                  <p className="text-sm">{expense}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 Don't worry about getting everything perfect - you can always add more expenses later from the dashboard.
        </p>
      </div>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button variant="outline" onClick={handleSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continue
        </Button>
      </div>

      <UnifiedExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
};

export default ExpensesStep;