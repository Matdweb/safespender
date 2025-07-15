import { useToast } from '@/hooks/use-toast';
import { useCreateExpense, useCreateTransaction } from '@/hooks/useFinancialData';

interface NewExpense {
  title: string;
  category: string;
  amount: number;
  type: 'one-time' | 'monthly';
  date?: string; // YYYY-MM-DD for one-time
  day_of_month?: number; // 1-31 for monthly
}

export const useExpenseManager = () => {
  const { toast } = useToast();
  const createExpenseMutation = useCreateExpense();
  const createTransactionMutation = useCreateTransaction();

  const addExpense = async (expense: NewExpense) => {
    try {
      const expenseData = {
        description: expense.title,
        category: expense.category,
        amount: expense.amount,
        is_recurring: expense.type === 'monthly',
        is_reserved: expense.type === 'monthly', // Monthly expenses are reserved by default
        ...(expense.type === 'one-time' 
          ? { 
              created_at: expense.date + 'T00:00:00.000Z',
              next_occurrence_date: null,
              day_of_month: null,
              recurring_type: null,
              recurring_interval: null,
              end_date: null
            }
          : { 
              created_at: new Date().toISOString(),
              day_of_month: expense.day_of_month,
              recurring_type: 'monthly',
              recurring_interval: 1,
              next_occurrence_date: calculateNextOccurrence(expense.day_of_month!),
              end_date: null
            }
        )
      };

      // Create the expense record
      await createExpenseMutation.mutateAsync(expenseData);
      
      // For one-time expenses that are today or in the past, also create a transaction record
      if (expense.type === 'one-time' && expense.date) {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expenseDate.setHours(0, 0, 0, 0);
        
        if (expenseDate <= today) {
          await createTransactionMutation.mutateAsync({
            type: 'expense',
            amount: expense.amount,
            description: expense.title,
            date: expense.date,
            category: expense.category,
            is_reserved: false
          });
        }
      }
      
      // For monthly expenses, create a transaction record if it's due this month
      if (expense.type === 'monthly' && expense.day_of_month) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const expenseDate = new Date(currentYear, currentMonth, expense.day_of_month);
        
        // Handle month day overflow
        if (expenseDate.getDate() !== expense.day_of_month) {
          expenseDate.setDate(0); // Go to last day of previous month
        }
        
        // If the expense date is today or in the past this month, create transaction
        if (expenseDate <= today && expenseDate.getMonth() === currentMonth) {
          const dateStr = expenseDate.toISOString().split('T')[0];
          await createTransactionMutation.mutateAsync({
            type: 'expense',
            amount: expense.amount,
            description: expense.title,
            date: dateStr,
            category: expense.category,
            is_reserved: true // Monthly expenses are reserved
          });
        }
      }
      
      toast({
        title: "Expense Added!",
        description: `${expense.title} (${expense.category}) - $${expense.amount.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to calculate next occurrence for monthly expenses
  const calculateNextOccurrence = (dayOfMonth: number): string => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Try current month first
    let nextDate = new Date(currentYear, currentMonth, dayOfMonth);
    
    // If the date has already passed this month, move to next month
    if (nextDate <= today) {
      nextDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
    }
    
    // Handle day fallback for months with fewer days
    if (nextDate.getDate() !== dayOfMonth) {
      // The day doesn't exist in this month (e.g., Feb 30), use last day of month
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
      // But cap at 28 for February consistency
      if (nextDate.getMonth() === 1 && dayOfMonth > 28) { // February
        nextDate = new Date(nextDate.getFullYear(), 1, 28);
      }
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  return {
    addExpense,
    isLoading: createExpenseMutation.isPending || createTransactionMutation.isPending,
  };
};