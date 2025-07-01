import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, TrendingUp } from 'lucide-react';
import EditGoalModal from './EditGoalModal';
import { Goal } from '@/contexts/FinancialContext';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard = ({ goal, onUpdate, onDelete }: GoalCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  
  // Calculate time to reach goal
  const calculateTimeToReach = () => {
    if (remaining <= 0) return { value: 0, unit: 'Complete!' };
    if (goal.recurringContribution <= 0) return { value: '∞', unit: 'No contributions set' };
    
    const monthsToGoal = remaining / goal.recurringContribution;
    const contributionsPerMonth = goal.contributionFrequency === 'weekly' ? 4.33 : 1;
    const actualMonths = monthsToGoal / contributionsPerMonth;
    
    if (actualMonths < 1) {
      const weeks = Math.ceil(actualMonths * 4.33);
      return { value: weeks, unit: weeks === 1 ? 'week' : 'weeks' };
    } else if (actualMonths < 12) {
      const months = Math.ceil(actualMonths);
      return { value: months, unit: months === 1 ? 'month' : 'months' };
    } else {
      const years = Math.ceil(actualMonths / 12);
      return { value: years, unit: years === 1 ? 'year' : 'years' };
    }
  };

  const timeToReach = calculateTimeToReach();

  return (
    <>
      <Card className="p-6 hover-lift cursor-pointer bg-card border border-border transition-all duration-200 hover:shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{goal.icon || '💰'}</div>
              <div>
                <h3 className="font-semibold text-foreground">{goal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="p-1 h-8 w-8 hover:bg-muted"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(goal.id)}
                className="p-1 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={Math.min(progress, 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">
                {progress.toFixed(0)}% complete
              </span>
              <span className="text-muted-foreground">
                ${remaining > 0 ? remaining.toLocaleString() : '0'} remaining
              </span>
            </div>
          </div>

          {/* Time to Reach */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Time to reach goal</span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {timeToReach.value === '∞' ? 'Set contributions' : 
               timeToReach.unit === 'Complete!' ? '🎉 Complete!' :
               `${timeToReach.value} ${timeToReach.unit}`}
            </div>
          </div>

          {/* Contribution Info */}
          <div className="text-sm text-muted-foreground">
            Contributing ${goal.recurringContribution.toLocaleString()} {goal.contributionFrequency}
          </div>
        </div>
      </Card>

      <EditGoalModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        goal={goal}
        onUpdateGoal={onUpdate}
      />
    </>
  );
};

export default GoalCard;
