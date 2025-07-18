import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSavingsGoals, useCreateTransaction, useUpdateSavingsGoal } from '@/hooks/useFinancialData';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currencyUtils';
import { PiggyBank } from 'lucide-react';

interface ExtraContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExtraContributionDialog = ({ open, onOpenChange }: ExtraContributionDialogProps) => {
  const [amount, setAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [description, setDescription] = useState('');

  const { data: goals } = useSavingsGoals();
  const { freeToSpend, currency } = useFinancialDashboard();
  const createTransactionMutation = useCreateTransaction();
  const updateSavingsGoalMutation = useUpdateSavingsGoal();
  const { toast } = useToast();

  const availableAmount = freeToSpend;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0 || !selectedGoalId) {
      return;
    }

    if (contributionAmount > availableAmount) {
      toast({
        title: "Insufficient Funds",
        description: "Contribution amount exceeds your available balance",
        variant: "destructive"
      });
      return;
    }

    const selectedGoal = goals?.find(g => g.id === selectedGoalId);
    if (!selectedGoal) return;

    try {
      // Update the goal's current amount
      await updateSavingsGoalMutation.mutateAsync({
        id: selectedGoalId,
        updates: {
          current_amount: parseFloat(selectedGoal.current_amount.toString()) + contributionAmount
        }
      });

      // Add a savings transaction
      await createTransactionMutation.mutateAsync({
        type: 'savings',
        amount: contributionAmount,
        description: description || `Extra contribution to ${selectedGoal.name}`,
        date: new Date().toISOString().split('T')[0],
        category: 'extra-contribution',
        goal_id: selectedGoalId
      });

      toast({
        title: "Contribution Added! 🎯",
        description: `${formatCurrency(contributionAmount, currency)} added to ${selectedGoal.name}`,
      });

      // Reset form
      setAmount('');
      setSelectedGoalId('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contribution",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blue-600" />
            Extra Contribution
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Make an extra contribution to one of your savings goals. This will be deducted from your available balance.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 font-medium">
              Available: {formatCurrency(availableAmount, currency)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Savings Goal</Label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a savings goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals?.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center gap-2">
                        <span>{goal.icon}</span>
                        <span>{goal.name}</span>
                        <span className="text-muted-foreground">
                          ({formatCurrency(parseFloat(goal.current_amount.toString()), currency)} / {formatCurrency(parseFloat(goal.target_amount.toString()), currency)})
                        </span>
                      </div>
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(availableAmount, currency)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Extra contribution"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
                className="flex-1"
                disabled={!amount || !selectedGoalId || parseFloat(amount) > availableAmount || parseFloat(amount) <= 0}
              >
                Add Contribution
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtraContributionDialog;