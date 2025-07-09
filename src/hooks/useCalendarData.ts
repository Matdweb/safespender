
import { useMemo, useState, useEffect } from 'react';
import { useTransactions } from './useFinancialData';
import { useFinancialDashboard } from './useFinancialDashboard';
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

export const useCalendarData = (currentDate: Date) => {
  const { data: transactions, isLoading } = useTransactions();
  const { generateSalaryTransactions, goals } = useFinancialDashboard();

  const calendarItems = useMemo(async () => {
    if (!transactions) return [];

    // Get calendar view range (current month + 1 month back and 2 months forward for context)
    const startOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);

    // Format dates for database queries
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Filter manual transactions for the date range
    const manualTransactionsInRange = transactions
      .filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00'); // Ensure consistent timezone
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

    // Generate salary transactions for the view range
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

    // Generate recurring expenses using the database function
    let recurringExpenseItems: CalendarTransaction[] = [];
    try {
      const { data: recurringExpenses } = await supabase.rpc('generate_recurring_expenses', {
        user_id_param: (await supabase.auth.getUser()).data.user?.id,
        start_date_param: formatDate(startOfRange),
        end_date_param: formatDate(endOfRange)
      });

      if (recurringExpenses) {
        recurringExpenseItems = recurringExpenses.map(expense => ({
          id: expense.id,
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

    // Add savings contributions as calendar items
    const savingsItems: CalendarTransaction[] = [];
    if (goals) {
      goals.forEach(goal => {
        if (goal.recurring_contribution && parseFloat(goal.recurring_contribution.toString()) > 0) {
          // Generate savings contributions for the view range
          const startMonth = startOfRange.getMonth();
          const startYear = startOfRange.getFullYear();
          const endMonth = endOfRange.getMonth();
          const endYear = endOfRange.getFullYear();
          
          // Generate for each month in the range
          for (let year = startYear; year <= endYear; year++) {
            const monthStart = year === startYear ? startMonth : 0;
            const monthEnd = year === endYear ? endMonth : 11;
            
            for (let month = monthStart; month <= monthEnd; month++) {
              const contributionDate = new Date(year, month, 1);
              
              // Adjust based on contribution frequency
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

    return [...manualTransactionsInRange, ...salaryItems, ...recurringExpenseItems, ...savingsItems];
  }, [transactions, currentDate, generateSalaryTransactions, goals]);

  // Convert async useMemo to sync by using useState and useEffect pattern
  const [calendarItemsState, setCalendarItemsState] = useState<CalendarTransaction[]>([]);
  
  useEffect(() => {
    const loadCalendarItems = async () => {
      const items = await calendarItems;
      setCalendarItemsState(items);
    };
    loadCalendarItems();
  }, [calendarItems]);

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarItemsState.filter(item => item.date === dateStr);
  };

  return {
    calendarItems: calendarItemsState,
    getItemsForDate,
    isLoading,
  };
};
