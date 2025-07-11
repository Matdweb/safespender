import { useToast } from '@/hooks/use-toast';
import { useCreateTransaction } from '@/hooks/useFinancialData';

export const useDashboardHandlers = () => {
  const { toast } = useToast();
  const createTransactionMutation = useCreateTransaction();

  const handleAddIncome = async (income: any) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'income',
        amount: income.amount,
        description: income.description,
        date: income.date
      });
      
      toast({
        title: "Income Added!",
        description: `$${income.amount.toLocaleString()} added to your account`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async (expense: any) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'expense',
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        category: expense.category,
        is_reserved: expense.isReserved,
      });
      
      toast({
        title: "Expense Recorded",
        description: `$${expense.amount.toLocaleString()} ${expense.category} expense added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const handleAddSavings = async (savings: { goalId: string; amount: number; description: string }) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'savings',
        amount: savings.amount,
        description: savings.description,
        date: new Date().toISOString().split('T')[0],
        goal_id: savings.goalId,
      });
      
      toast({
        title: "Savings Added!",
        description: `$${savings.amount.toLocaleString()} added to your savings goal`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings",
        variant: "destructive"
      });
    }
  };

  const handleSetSalary = () => {
    toast({
      title: "Salary Modal",
      description: "Opening salary configuration modal",
    });
  };

  return {
    handleAddIncome,
    handleAddExpense,
    handleAddSavings,
    handleSetSalary,
  };
};