import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSavingsGoal } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const goalIcons = ['💰', '🏠', '🚗', '🏖️', '🎓', '💍', '🛡️', '📱', '🎯', '🌟'];

const AddGoalModal = ({ open, onOpenChange }: AddGoalModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    recurringContribution: '',
    icon: '💰'
  });

  const createGoalMutation = useCreateSavingsGoal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) return;

    try {
      await createGoalMutation.mutateAsync({
        name: formData.name,
        target_amount: parseFloat(formData.targetAmount),
        current_amount: parseFloat(formData.currentAmount) || 0,
        recurring_contribution: parseFloat(formData.recurringContribution) || 0,
        icon: formData.icon
      });

      toast({
        title: "Goal Created!",
        description: `${formData.name} goal has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        recurringContribution: '',
        icon: '💰'
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Savings Goal</DialogTitle>
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
              disabled={createGoalMutation.isPending}
            >
              {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalModal;