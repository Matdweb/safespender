import { useEffect, useCallback, useRef } from 'react';
import { useExpenses, useTransactions } from '@/hooks/useFinancialData';
import { supabase } from '@/integrations/supabase/client';

export const useExpenseTransactionSync = () => {
  const { data: expenses } = useExpenses();
  const { data: transactions } = useTransactions();
  const lastSyncRef = useRef<string>(''); // Track last sync to prevent duplicates

  const syncExpenseTransactions = useCallback(async () => {
    if (!expenses || !transactions) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a unique key for this sync to prevent duplicate runs
    const syncKey = `${user.id}-${today.toISOString().split('T')[0]}-${expenses.length}-${transactions.length}`;
    if (lastSyncRef.current === syncKey) {
      return; // Already processed this exact state
    }

    const pendingTransactions = [];

    for (const expense of expenses) {
      if (!expense.is_recurring || !expense.day_of_month) continue;

      const expenseCreatedDate = new Date(expense.created_at);
      
      // Only process recurring expenses that were created before or on today
      if (expenseCreatedDate > today) continue;

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

      // Only process if:
      // 1. The expense date has passed or is today
      // 2. The expense date is after or on the expense creation date
      if (expenseDate <= today && expenseDate >= new Date(expenseCreatedDate.getFullYear(), expenseCreatedDate.getMonth(), expenseCreatedDate.getDate())) {
        const dateStr = expenseDate.toISOString().split('T')[0];
        
        // More specific check for existing transactions to prevent duplicates
        const existingTransaction = transactions.find(t => 
          t.type === 'expense' && 
          t.description === expense.description && 
          t.date === dateStr &&
          t.category === expense.category &&
          Math.abs(t.amount - expense.amount) < 0.01 && // Handle floating point precision
          t.is_reserved === true
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

    // Only insert if we have new transactions and mark sync as complete
    if (pendingTransactions.length > 0) {
      try {
        await supabase.from('transactions').insert(pendingTransactions);
        lastSyncRef.current = syncKey; // Mark this sync as complete
      } catch (error) {
        console.error('Error creating expense transactions:', error);
      }
    } else {
      lastSyncRef.current = syncKey; // Mark sync as complete even if no new transactions
    }
  }, [expenses, transactions]);

  useEffect(() => {
    syncExpenseTransactions();
  }, [syncExpenseTransactions]);
};