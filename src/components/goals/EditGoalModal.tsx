import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateSavingsGoal } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface EditGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Tables<'savings_goals'>;
}

const goalIcons = ['💰', '🏠', '🚗', '🏖️', '🎓', '💍', '🛡️', '📱', '🎯', '🌟'];

const EditGoalModal = ({ open, onOpenChange, goal }: EditGoalModalProps) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    targetAmount: goal.target_amount.toString(),
    currentAmount: goal.current_amount.toString(),
    recurringContribution: (goal.recurring_contribution || 0).toString(),
    icon: goal.icon || '💰'
  });

  const updateGoalMutation = useUpdateSavingsGoal();
  const { toast } = useToast();

  // Update form data when goal changes
  useEffect(() => {
    setFormData({
      name: goal.name,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      recurringContribution: (goal.recurring_contribution || 0).toString(),
      icon: goal.icon || '💰'
    });
  }, [goal]);

  // Calculate what-if scenarios
  const calculateTimeToReach = (contribution: number) => {
    const remaining = parseFloat(formData.targetAmount) - parseFloat(formData.currentAmount);
    if (remaining <= 0 || contribution <= 0) return null;
    
    const monthsToGoal = remaining / contribution;
    
    if (monthsToGoal < 1) {
      return 'Less than 1 month';
    } else if (monthsToGoal < 12) {
      const months = Math.ceil(monthsToGoal);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.ceil(monthsToGoal / 12);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const currentTimeToReach = calculateTimeToReach(parseFloat(formData.recurringContribution) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) return;

    try {
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        updates: {
          name: formData.name,
          target_amount: parseFloat(formData.targetAmount),
          current_amount: parseFloat(formData.currentAmount) || 0,
          recurring_contribution: parseFloat(formData.recurringContribution) || 0,
          icon: formData.icon
        }
      });

      toast({
        title: "Goal Updated!",
        description: `${formData.name} has been updated successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Savings Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Choose an Icon</Label>
            <div className="flex flex-wrap gap-2">
              {goalIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`p-2 rounded-lg text-xl hover:bg-muted transition-colors ${
                    formData.icon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="Emergency Fund, Vacation, etc."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="5000"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurringContribution">Monthly Contribution</Label>
            <Input
              id="recurringContribution"
              type="number"
              placeholder="200"
              value={formData.recurringContribution}
              onChange={(e) => setFormData(prev => ({ ...prev, recurringContribution: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Contributions are automatically scheduled for the 16th of each month
            </p>
          </div>

          {/* What-if Preview */}
          {currentTimeToReach && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-sm font-medium text-foreground mb-1">
                Time to reach goal
              </div>
              <div className="text-lg font-semibold text-primary">
                {currentTimeToReach}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={updateGoalMutation.isPending}
            >
              {updateGoalMutation.isPending ? 'Updating...' : 'Update Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalModal;