
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
      <Card className="p-4 hover-lift cursor-pointer bg-white dark:bg-neutral-800 " onClick={onAddIncome}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Income</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Record earnings</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer bg-white dark:bg-neutral-800 " onClick={onAddExpense}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-destructive/5 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-destructive rotate-180" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Expense</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Track spending</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer bg-white dark:bg-neutral-800 " onClick={onViewCalendar}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-[#3b82f61a] rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Calendar</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Plan ahead</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer bg-white dark:bg-neutral-800 " onClick={onViewGoals}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Goals</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Track progress</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickActions;
