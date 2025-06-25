
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Calendar, Target } from 'lucide-react';

interface QuickActionsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
  onViewCalendar: () => void;
  onViewGoals: () => void;
}

const QuickActions = ({ onAddIncome, onAddExpense, onViewCalendar, onViewGoals }: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 hover-lift cursor-pointer card-gradient border-subtle" onClick={onAddIncome}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-finance-primary/10 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-finance-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Income</h3>
            <p className="text-xs text-subtle">Record earnings</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer card-gradient border-subtle" onClick={onAddExpense}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-finance-neutral-100 dark:bg-finance-neutral-800 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-finance-neutral-600 dark:text-finance-neutral-400 rotate-180" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Expense</h3>
            <p className="text-xs text-subtle">Track spending</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer card-gradient border-subtle" onClick={onViewCalendar}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-finance-teal-50 dark:bg-finance-teal-700/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-finance-teal-600 dark:text-finance-teal-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Calendar</h3>
            <p className="text-xs text-subtle">Plan ahead</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer card-gradient border-subtle" onClick={onViewGoals}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-finance-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-finance-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Goals</h3>
            <p className="text-xs text-subtle">Track progress</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickActions;
