import { useMemo } from 'react';
import { useTransactions } from './useFinancialData';
import { useSalary } from './useSalary';
import { useCalendarExpenses } from './useCalendarExpenses';
import { useSavingsCalendar } from './useSavingsCalendar';
import { generateSalaryTransactions } from '@/services/salaryService';

export interface CalendarTransaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  date: string;
  category?: string;
  description: string;
  source: 'transaction' | 'expense' | 'salary' | 'savings';
}

export const useEnhancedCalendar = (currentDate: Date) => {
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: salary, isLoading: isLoadingSalary } = useSalary();
  
  // Get expenses for current viewing month plus surrounding months
  const startMonth = currentDate.getMonth() - 1;
  const startYear = currentDate.getFullYear();
  const endMonth = currentDate.getMonth() + 2;
  const endYear = currentDate.getFullYear();
  
  const expensesThisMonth = useCalendarExpenses(currentDate.getMonth(), currentDate.getFullYear());
  const expensesPrevMonth = useCalendarExpenses(startMonth < 0 ? 11 : startMonth, startMonth < 0 ? startYear - 1 : startYear);
  const expensesNextMonth = useCalendarExpenses((currentDate.getMonth() + 1) % 12, currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear());
  const expensesNext2Month = useCalendarExpenses((currentDate.getMonth() + 2) % 12, currentDate.getMonth() >= 10 ? currentDate.getFullYear() + 1 : currentDate.getFullYear());

  // Get savings contributions for calendar months
  const savingsThisMonth = useSavingsCalendar(currentDate.getMonth(), currentDate.getFullYear());
  const savingsPrevMonth = useSavingsCalendar(startMonth < 0 ? 11 : startMonth, startMonth < 0 ? startYear - 1 : startYear);
  const savingsNextMonth = useSavingsCalendar((currentDate.getMonth() + 1) % 12, currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear());
  const savingsNext2Month = useSavingsCalendar((currentDate.getMonth() + 2) % 12, currentDate.getMonth() >= 10 ? currentDate.getFullYear() + 1 : currentDate.getFullYear());

  const calendarItems = useMemo(() => {
    // Get calendar view range
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
          source: 'transaction' as const,
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
        source: 'salary' as const,
      }));

      allItems.push(...salaryItems);
    }

    // Add expenses from the new expense system
    const allExpenses = [
      ...expensesPrevMonth,
      ...expensesThisMonth, 
      ...expensesNextMonth,
      ...expensesNext2Month
    ];

    const expenseItems = allExpenses.map(expense => ({
      id: expense.id,
      type: 'expense' as const,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString().split('T')[0],
      category: expense.category,
      description: expense.title,
      source: 'expense' as const,
    }));

    allItems.push(...expenseItems);

    // Add programmed savings contributions
    const allSavingsContributions = [
      ...savingsPrevMonth,
      ...savingsThisMonth,
      ...savingsNextMonth,
      ...savingsNext2Month
    ];

    const savingsItems = allSavingsContributions.map(contribution => ({
      id: contribution.id,
      type: 'savings' as const,
      title: contribution.title,
      amount: contribution.amount,
      date: contribution.date.toISOString().split('T')[0],
      category: 'savings-contribution',
      description: contribution.title,
      source: 'savings' as const,
    }));

    allItems.push(...savingsItems);

    return allItems;
  }, [transactions, salary, currentDate, expensesPrevMonth, expensesThisMonth, expensesNextMonth, expensesNext2Month, savingsPrevMonth, savingsThisMonth, savingsNextMonth, savingsNext2Month]);

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