
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
}

const SavingsGoals = ({ goals, onAddGoal }: SavingsGoalsProps) => {
  return (
    <Card className="p-6 card-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-finance-primary" />
          <h3 className="font-semibold">Savings Goals</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={onAddGoal} className="p-1 h-8 w-8 hover:bg-finance-neutral-100 dark:hover:bg-finance-neutral-800">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-subtle mb-4">No savings goals yet</p>
            <Button onClick={onAddGoal} size="sm" className="bg-finance-primary hover:bg-finance-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    <p className="text-xs text-subtle">
                      ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-finance-primary">
                      {progress.toFixed(0)}%
                    </p>
                    {goal.deadline && (
                      <p className="text-xs text-subtle">
                        Due {new Date(goal.deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                <Progress value={progress} className="h-2" />
                
                <p className="text-xs text-subtle">
                  ${remaining.toLocaleString()} remaining
                </p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default SavingsGoals;
