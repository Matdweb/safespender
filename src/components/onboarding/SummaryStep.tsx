
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Calendar, Target, TrendingUp } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';
import { useFinancial } from '@/contexts/FinancialContext';

interface SummaryStepProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

const SummaryStep = ({ data, onNext, onBack }: SummaryStepProps) => {
  const { addTransaction, addGoal } = useFinancial();

  useEffect(() => {
    // Add the income transaction
    if (data.income) {
      addTransaction({
        type: 'income',
        amount: data.income.amount,
        description: data.income.description,
        date: data.income.date,
        recurring: data.income.frequency !== 'one-time' ? {
          type: data.income.frequency === 'biweekly' ? 'biweekly' : 
                data.income.frequency === 'weekly' ? 'weekly' : 'monthly',
          interval: 1
        } : undefined
      });
    }

    // Add expense transactions
    data.expenses.forEach(expense => {
      const expenseDate = new Date();
      if (expense.dayOfMonth) {
        expenseDate.setDate(expense.dayOfMonth);
        if (expenseDate < new Date()) {
          expenseDate.setMonth(expenseDate.getMonth() + 1);
        }
      }

      addTransaction({
        type: 'expense',
        amount: expense.amount,
        description: expense.description,
        date: expenseDate.toISOString().split('T')[0],
        category: expense.category,
        isReserved: true,
        recurring: expense.recurring
      });
    });

    // Add the goal
    if (data.goal) {
      addGoal({
        name: data.goal.name,
        targetAmount: data.goal.targetAmount,
        currentAmount: 0,
        recurringContribution: data.goal.recurringContribution,
        contributionFrequency: data.goal.contributionFrequency,
        icon: data.goal.icon
      });
    }
  }, [data, addTransaction, addGoal]);

  const totalIncome = data.income ? data.income.amount : 0;
  const totalExpenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const goalContribution = data.goal ? data.goal.recurringContribution : 0;
  const freeToSpend = totalIncome - totalExpenses - goalContribution;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            You're all set!
          </h2>
          <p className="text-muted-foreground">
            Here's your financial foundation. You can always adjust these later.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Free to Spend Summary */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Free-to-Spend</h3>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">
            ${freeToSpend.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Available after bills and savings each month
          </p>
        </Card>

        {/* Income Summary */}
        {data.income && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Income Setup</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              ${data.income.amount.toLocaleString()} from {data.income.description}
              {data.income.frequency !== 'one-time' && ` • ${data.income.frequency}`}
            </p>
          </Card>
        )}

        {/* Expenses Summary */}
        {data.expenses.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <h4 className="font-medium">Upcoming Bills</h4>
            </div>
            <div className="space-y-1">
              {data.expenses.slice(0, 3).map((expense, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  ${expense.amount.toLocaleString()} • {expense.description}
                </p>
              ))}
              {data.expenses.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  ...and {data.expenses.length - 3} more
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Goal Summary */}
        {data.goal && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Savings Goal</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.goal.icon} {data.goal.name} • ${data.goal.targetAmount.toLocaleString()} target
            </p>
            {data.goal.recurringContribution > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Saving ${data.goal.recurringContribution} {data.goal.contributionFrequency}
              </p>
            )}
          </Card>
        )}
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          🚀 Ready to take control of your finances? Your dashboard is waiting with all your data synced and ready to go!
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            onClick={onNext}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 hover-lift"
          >
            Go to Dashboard 🎯
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;
