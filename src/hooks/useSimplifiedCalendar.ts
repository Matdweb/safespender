import { useMemo } from 'react';
import { useTransactions } from './useFinancialData';
import { useSalary } from './useSalary';
import { generateSalaryTransactions } from '@/services/salaryService';

export interface CalendarTransaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  date: string;
  category?: string;
  description: string;
}

export const useSimplifiedCalendar = (currentDate: Date) => {
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: salary, isLoading: isLoadingSalary } = useSalary();

  const calendarItems = useMemo(() => {
    if (!transactions && !salary) return [];

    // Get calendar view range (current month + 1 month back and 2 months forward for context)
    const startOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);

    const allItems: CalendarTransaction[] = [];

    // Add manual transactions
    if (transactions) {
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

      allItems.push(...manualTransactionsInRange);
    }

    // Add salary transactions
    if (salary) {
      const salaryTransactions = generateSalaryTransactions(salary, startOfRange, endOfRange);
      const salaryItems = salaryTransactions.map(t => ({
        id: t.id,
        type: 'income' as const,
        title: t.description,
        amount: t.amount,
        date: t.date,
        category: t.category,
        description: t.description,
      }));

      allItems.push(...salaryItems);
    }

    return allItems;
  }, [transactions, salary, currentDate]);

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarItems.filter(item => item.date === dateStr);
  };

  return {
    calendarItems,
    getItemsForDate,
    isLoading: isLoadingTransactions || isLoadingSalary,
  };
};