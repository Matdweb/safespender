import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal } from '@/contexts/FinancialContext';

interface EditGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onUpdateGoal: (goal: Goal) => void;
}

const goalIcons = ['💰', '🏠', '🚗', '🏖️', '🎓', '💍', '🛡️', '📱', '🎯', '🌟'];

const EditGoalModal = ({ open, onOpenChange, goal, onUpdateGoal }: EditGoalModalProps) => {
  const [formData, setFormData] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    currentAmount: goal.currentAmount.toString(),
    recurringContribution: goal.recurringContribution.toString(),
    contributionFrequency: goal.contributionFrequency,
    icon: goal.icon || '💰'
  });

  // Update form data when goal changes
  useEffect(() => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      recurringContribution: goal.recurringContribution.toString(),
      contributionFrequency: goal.contributionFrequency,
      icon: goal.icon || '💰'
    });
  }, [goal]);

  // Calculate what-if scenarios
  const calculateTimeToReach = (contribution: number, frequency: string) => {
    const remaining = parseFloat(formData.targetAmount) - parseFloat(formData.currentAmount);
    if (remaining <= 0 || contribution <= 0) return null;
    
    const contributionsPerMonth = frequency === 'weekly' ? 4.33 : 1;
    const monthsToGoal = remaining / (contribution * contributionsPerMonth);
    
    if (monthsToGoal < 1) {
      const weeks = Math.ceil(monthsToGoal * 4.33);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else if (monthsToGoal < 12) {
      const months = Math.ceil(monthsToGoal);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.ceil(monthsToGoal / 12);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };

  const currentTimeToReach = calculateTimeToReach(
    parseFloat(formData.recurringContribution) || 0,
    formData.contributionFrequency
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) return;

    onUpdateGoal({
      ...goal,
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      recurringContribution: parseFloat(formData.recurringContribution) || 0,
      contributionFrequency: formData.contributionFrequency,
      icon: formData.icon
    });
    
    onOpenChange(false);
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
            <Label htmlFor="recurringContribution">Regular Contribution</Label>
            <div className="flex gap-2">
              <Input
                id="recurringContribution"
                type="number"
                placeholder="200"
                value={formData.recurringContribution}
                onChange={(e) => setFormData(prev => ({ ...prev, recurringContribution: e.target.value }))}
                className="flex-1"
              />
              <Select
                value={formData.contributionFrequency}
                onValueChange={(value: 'weekly' | 'monthly') => 
                  setFormData(prev => ({ ...prev, contributionFrequency: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            >
              Update Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalModal;
