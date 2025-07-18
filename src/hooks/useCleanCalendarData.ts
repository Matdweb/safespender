import { useMemo, useState, useEffect } from 'react';
import { useTransactions } from './useFinancialData';
import { useSimplifiedFinancialDashboard } from './useSimplifiedFinancialDashboard';
import { CalendarItem } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarTransaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  date: string;
  category?: string;
  description: string;
}

export const useCleanCalendarData = (currentDate: Date) => {
  const { data: transactions, isLoading } = useTransactions();
  const { generateSalaryTransactions, goals } = useSimplifiedFinancialDashboard();

  const [calendarItemsState, setCalendarItemsState] = useState<CalendarTransaction[]>([]);
  
  useEffect(() => {
    const loadCalendarItems = async () => {
      if (!transactions) return;

      // Get calendar view range (current month + 1 month back and 2 months forward for context)
      const startOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);

      // Format dates for database queries
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // 1. Manual transactions (one-time income/expenses) - these are the source of truth
      const manualTransactionsInRange = transactions
        .filter(t => {
          const transactionDate = new Date(t.date + 'T00:00:00');
          return transactionDate >= startOfRange && transactionDate <= endOfRange;
        })
        .map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense' | 'savings',
          title: t.description,
          amount: parseFloat(t.amount.toString()),
          date: t.date,
          category: t.category || undefined,
          description: t.description,
        }));

      // 2. Generated salary transactions (these don't exist in DB, only for display)
      const salaryTransactions = generateSalaryTransactions(startOfRange, endOfRange);
      const salaryItems = salaryTransactions.map(t => ({
        id: t.id,
        type: 'income' as const,
        title: t.description,
        amount: t.amount,
        date: t.date,
        category: t.category,
        description: t.description,
      }));

      // 3. Generated recurring expenses (from expenses table, displayed only)
      let recurringExpenseItems: CalendarTransaction[] = [];
      try {
        const { data: recurringExpenses } = await supabase.rpc('generate_recurring_expenses', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          start_date_param: formatDate(startOfRange),
          end_date_param: formatDate(endOfRange)
        });

        if (recurringExpenses) {
          recurringExpenseItems = recurringExpenses.map(expense => ({
            id: `recurring-${expense.id}`, // Prefix to distinguish from transactions
            type: 'expense' as const,
            title: expense.description,
            amount: parseFloat(expense.amount.toString()),
            date: expense.date,
            category: expense.category || undefined,
            description: expense.description,
          }));
        }
      } catch (error) {
        console.error('Error generating recurring expenses:', error);
      }

      // 4. Generated savings contributions (displayed only)
      const savingsItems: CalendarTransaction[] = [];
      if (goals) {
        goals.forEach(goal => {
          if (goal.recurring_contribution && parseFloat(goal.recurring_contribution.toString()) > 0) {
            const startMonth = startOfRange.getMonth();
            const startYear = startOfRange.getFullYear();
            const endMonth = endOfRange.getMonth();
            const endYear = endOfRange.getFullYear();
            
            for (let year = startYear; year <= endYear; year++) {
              const monthStart = year === startYear ? startMonth : 0;
              const monthEnd = year === endYear ? endMonth : 11;
              
              for (let month = monthStart; month <= monthEnd; month++) {
                const contributionDate = new Date(year, month, 1);
                
                if (goal.contribution_frequency === 'monthly') {
                  contributionDate.setDate(1);
                } else if (goal.contribution_frequency === 'biweekly') {
                  contributionDate.setDate(15);
                } else if (goal.contribution_frequency === 'weekly') {
                  contributionDate.setDate(7);
                }
                
                if (contributionDate >= startOfRange && contributionDate <= endOfRange) {
                  savingsItems.push({
                    id: `savings-${goal.id}-${contributionDate.getTime()}`,
                    type: 'savings',
                    title: `💰 ${goal.name} Savings`,
                    amount: parseFloat(goal.recurring_contribution.toString()),
                    date: formatDate(contributionDate),
                    category: 'savings',
                    description: `Savings contribution to ${goal.name}`,
                  });
                }
              }
            }
          }
        });
      }

      const allItems = [...manualTransactionsInRange, ...salaryItems, ...recurringExpenseItems, ...savingsItems];
      setCalendarItemsState(allItems);
    };

    loadCalendarItems();
  }, [transactions, currentDate, generateSalaryTransactions, goals]);

const getItemsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0];

  // Preprocess: adjust all savings item dates to the 16th
  const adjustedItems = calendarItemsState.map(item => {
    if (item.type === 'savings') {
      const originalDate = new Date(item.date);
      if (originalDate.getDate() !== 16) {
        const newDate = new Date(originalDate);
        newDate.setDate(16);
        const newDateStr = newDate.toISOString().split('T')[0];
        return { ...item, date: newDateStr };
      }
    }
    return item;
  });

  // Now filter using the mutated dateStr
  return adjustedItems.filter(item => item.date === dateStr);
};

  return {
    calendarItems: calendarItemsState,
    getItemsForDate,
    isLoading,
  };
};