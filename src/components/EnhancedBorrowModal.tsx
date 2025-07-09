
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, DollarSign, PiggyBank, Calendar, Target } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import CurrencyDisplay from './CurrencyDisplay';

interface EnhancedBorrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedBorrowModal = ({ open, onOpenChange }: EnhancedBorrowModalProps) => {
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  
  const { 
    getNextIncomeAmount, 
    getNextIncomeDate, 
    borrowFromNextIncome, 
    getPendingExpenses,
    goals,
    updateGoal,
    addTransaction
  } = useFinancial();
  const { toast } = useToast();

  const nextIncomeDate = getNextIncomeDate();
  const nextIncomeAmount = getNextIncomeAmount();
  const pendingExpenses = getPendingExpenses();
  
  // Calculate upcoming savings until next income
  const upcomingSavings = goals
    .filter(goal => goal.recurringContribution > 0)
    .reduce((sum, goal) => {
      if (!nextIncomeDate) return sum;
      const today = new Date();
      const daysBetween = Math.ceil((nextIncomeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let contributions = 0;
      switch (goal.contributionFrequency) {
        case 'weekly':
          contributions = Math.floor(daysBetween / 7);
          break;
        case 'biweekly':
          contributions = Math.floor(daysBetween / 14);
          break;
        case 'monthly':
          contributions = Math.floor(daysBetween / 30);
          break;
      }
      
      return sum + (contributions * goal.recurringContribution);
    }, 0);

  const availableAfterObligations = Math.max(0, nextIncomeAmount - pendingExpenses - upcomingSavings);
  const maxAdvanceAmount = Math.floor(availableAfterObligations * 0.8);
  
  // Calculate total savings available for withdrawal
  const totalSavingsAvailable = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  
  // Calculate impact on selected goal
  const calculateGoalImpact = (goalId: string, withdrawAmount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.recurringContribution <= 0) return null;
    
    const remainingToTarget = goal.targetAmount - (goal.currentAmount - withdrawAmount);
    if (remainingToTarget <= 0) return null;
    
    const weeksToComplete = Math.ceil(remainingToTarget / goal.recurringContribution);
    
    let timeUnit = 'weeks';
    let timeValue = weeksToComplete;
    
    if (goal.contributionFrequency === 'biweekly') {
      timeValue = Math.ceil(weeksToComplete / 2);
    } else if (goal.contributionFrequency === 'monthly') {
      timeValue = Math.ceil(weeksToComplete / 4);
      timeUnit = 'months';
    }
    
    return { timeValue, timeUnit };
  };

  const handleAdvance = () => {
    const amount = parseFloat(advanceAmount);
    if (amount > 0 && amount <= maxAdvanceAmount) {
      borrowFromNextIncome(amount, reason || 'Income advance');
      
      toast({
        title: "Advance Approved! 💰",
        description: `$${amount.toLocaleString()} added to your available balance`,
      });
      
      resetAndClose();
    }
  };

  const handleSavingsWithdrawal = () => {
    const amount = parseFloat(savingsAmount);
    const goal = goals.find(g => g.id === selectedGoalId);
    
    if (amount > 0 && goal && amount <= goal.currentAmount) {
      // Update the goal's current amount
      updateGoal(selectedGoalId, {
        currentAmount: goal.currentAmount - amount
      });
      
      // Add a withdrawal transaction
      addTransaction({
        type: 'expense',
        amount: -amount, // Negative because we're adding money back to free spend
        description: `Withdrawn from ${goal.name} savings`,
        date: new Date().toISOString().split('T')[0],
        category: 'savings-withdrawal',
        goalId: selectedGoalId
      });
      
      toast({
        title: "Savings Withdrawn! 🏦",
        description: `$${amount.toLocaleString()} withdrawn from ${goal.name}`,
      });
      
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setAdvanceAmount('');
    setSavingsAmount('');
    setReason('');
    setSelectedGoalId('');
    onOpenChange(false);
  };

  const reasonOptions = [
    'Emergency',
    'Groceries',
    'Medical',
    'Transportation',
    'Utilities',
    'Other'
  ];

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const withdrawAmount = parseFloat(savingsAmount) || 0;
  const goalImpact = selectedGoal ? calculateGoalImpact(selectedGoalId, withdrawAmount) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            I Need More Money
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Choose how you'd like to get more money. Each option has different impacts on your financial goals.
            </p>
          </div>

          <Tabs defaultValue="advance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="advance" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Income Advance
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Withdraw Savings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="advance" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Borrow from Next Income</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Get money now from your next programmed salary. This will reduce your next paycheck accordingly.
                </p>
                {nextIncomeDate && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                    Next salary: {nextIncomeDate.toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance-amount">Amount to Advance</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="advance-amount"
                    type="number"
                    placeholder="0.00"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="pl-10"
                    max={maxAdvanceAmount}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum: <CurrencyDisplay amount={maxAdvanceAmount} className="inline" /> (available after obligations)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance-reason">Reason (Optional)</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next Salary:</span>
                  <span className="font-medium"><CurrencyDisplay amount={nextIncomeAmount} className="inline" /></span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>- Upcoming Bills:</span>
                  <span><CurrencyDisplay amount={pendingExpenses} className="inline" /></span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>- Upcoming Savings:</span>
                  <span><CurrencyDisplay amount={upcomingSavings} className="inline" /></span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-medium">
                  <span>Available to Advance:</span>
                  <span><CurrencyDisplay amount={availableAfterObligations} className="inline" /></span>
                </div>
                {parseFloat(advanceAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>After Advance:</span>
                    <span className="font-medium">
                      <CurrencyDisplay amount={availableAfterObligations - (parseFloat(advanceAmount) || 0)} className="inline" />
                    </span>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleAdvance} 
                disabled={!advanceAmount || parseFloat(advanceAmount) <= 0 || parseFloat(advanceAmount) > maxAdvanceAmount}
                className="w-full"
              >
                Get Advance: <CurrencyDisplay amount={parseFloat(advanceAmount) || 0} className="inline ml-1" />
              </Button>
            </TabsContent>

            <TabsContent value="savings" className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Withdraw from Savings</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Use money you've already saved toward your goals. This will delay your goal completion.
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-2 font-medium">
                  Total Available: <CurrencyDisplay amount={totalSavingsAvailable} className="inline" />
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="savings-goal">Choose Savings Goal</Label>
                <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal to withdraw from" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.filter(goal => goal.currentAmount > 0).map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex items-center gap-2">
                          <span>{goal.icon}</span>
                          <span>{goal.name}</span>
                          <span className="text-muted-foreground">
                            (<CurrencyDisplay amount={goal.currentAmount} className="inline" /> saved)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGoal && (
                <div className="space-y-2">
                  <Label htmlFor="savings-amount">Amount to Withdraw</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="savings-amount"
                      type="number"
                      placeholder="0.00"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(e.target.value)}
                      className="pl-10"
                      max={selectedGoal.currentAmount}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: <CurrencyDisplay amount={selectedGoal.currentAmount} className="inline" />
                  </p>
                </div>
              )}

              {selectedGoal && withdrawAmount > 0 && goalImpact && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">Goal Impact</h4>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    This action delays your <strong>{selectedGoal.name}</strong> goal by approximately{' '}
                    <strong>{goalImpact.timeValue} {goalImpact.timeUnit}</strong>.
                  </p>
                  <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    New completion time based on current contributions: {goalImpact.timeValue} {goalImpact.timeUnit}
                  </div>
                </div>
              )}

              {selectedGoal && (
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal Target:</span>
                    <span className="font-medium"><CurrencyDisplay amount={selectedGoal.targetAmount} className="inline" /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Currently Saved:</span>
                    <span><CurrencyDisplay amount={selectedGoal.currentAmount} className="inline" /></span>
                  </div>
                  {withdrawAmount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>After Withdrawal:</span>
                      <span className="font-medium">
                        <CurrencyDisplay amount={selectedGoal.currentAmount - withdrawAmount} className="inline" />
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleSavingsWithdrawal} 
                disabled={!selectedGoal || !savingsAmount || parseFloat(savingsAmount) <= 0 || parseFloat(savingsAmount) > selectedGoal.currentAmount}
                className="w-full"
                variant="destructive"
              >
                Withdraw: <CurrencyDisplay amount={withdrawAmount} className="inline ml-1" />
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAndClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBorrowModal;
