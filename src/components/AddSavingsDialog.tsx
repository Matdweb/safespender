
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSavingsGoals } from '@/hooks/useFinancialData';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { getCurrencySymbol, formatCurrency } from '@/utils/currencyUtils';

interface AddSavingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSavings: (savings: { goalId: string; amount: number; description: string }) => void;
  selectedDate?: Date | null;
}

const AddSavingsDialog = ({ open, onOpenChange, onAddSavings, selectedDate }: AddSavingsDialogProps) => {
  const { data: goals } = useSavingsGoals();
  const { freeToSpend, currency } = useFinancialDashboard();
  const [amount, setAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [description, setDescription] = useState('');

  const availableAmount = freeToSpend;
  const currencySymbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0 || !selectedGoalId) {
      return;
    }

    if (contributionAmount > availableAmount) {
      alert('Contribution amount exceeds your available balance');
      return;
    }

    const selectedGoal = goals?.find(g => g.id === selectedGoalId);
    const finalDescription = description || `Extra contribution to ${selectedGoal?.name}`;

    onAddSavings({
      goalId: selectedGoalId,
      amount: contributionAmount,
      description: finalDescription
    });

    // Reset form
    setAmount('');
    setSelectedGoalId('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Savings Contribution</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal">Savings Goal</Label>
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a savings goal" />
              </SelectTrigger>
              <SelectContent>
                {goals?.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.icon} {goal.name}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ({currency})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">{currencySymbol}</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available: {formatCurrency(availableAmount, currency)}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Extra contribution"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div className="text-sm text-muted-foreground">
              Date: {selectedDate.toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!amount || !selectedGoalId || parseFloat(amount) > availableAmount}
            >
              Add Contribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSavingsDialog;
