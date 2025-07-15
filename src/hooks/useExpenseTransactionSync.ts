import { useEffect, useCallback } from 'react';
import { useExpenses, useTransactions } from '@/hooks/useFinancialData';
import { supabase } from '@/integrations/supabase/client';

export const useExpenseTransactionSync = () => {
  const { data: expenses } = useExpenses();
  const { data: transactions } = useTransactions();

  const syncExpenseTransactions = useCallback(async () => {
    if (!expenses || !transactions) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const pendingTransactions = [];

    for (const expense of expenses) {
      if (!expense.is_recurring || !expense.day_of_month) continue;

      // Calculate if this expense is due for this month
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      let expenseDate = new Date(currentYear, currentMonth, expense.day_of_month);
      
      // Handle month day overflow (e.g., Feb 30 -> Feb 28)
      if (expenseDate.getDate() !== expense.day_of_month) {
        if (currentMonth === 1 && expense.day_of_month > 28) { // February
          expenseDate = new Date(currentYear, 1, 28);
        } else {
          expenseDate = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
        }
      }

      // Only process if the expense date has passed or is today
      if (expenseDate <= today) {
        const dateStr = expenseDate.toISOString().split('T')[0];
        
        // Check if we already have a transaction for this expense on this date
        const existingTransaction = transactions.find(t => 
          t.type === 'expense' && 
          t.description === expense.description && 
          t.date === dateStr &&
          t.category === expense.category &&
          t.amount === expense.amount
        );

        if (!existingTransaction) {
          pendingTransactions.push({
            type: 'expense',
            amount: expense.amount,
            description: expense.description,
            date: dateStr,
            category: expense.category,
            is_reserved: true,
            user_id: user.id
          });
        }
      }
    }

    // Batch insert all pending transactions
    if (pendingTransactions.length > 0) {
      try {
        await supabase.from('transactions').insert(pendingTransactions);
      } catch (error) {
        console.error('Error creating expense transactions:', error);
      }
    }
  }, [expenses, transactions]);

  useEffect(() => {
    syncExpenseTransactions();
  }, [syncExpenseTransactions]);
};