import { useMemo } from 'react';
import { useExpenses } from '@/hooks/useFinancialData';

interface CalendarExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  type: 'one-time' | 'monthly';
}

export const useCalendarExpenses = (month: number, year: number): CalendarExpense[] => {
  const { data: expenses } = useExpenses();

  return useMemo(() => {
    if (!expenses) return [];

    const calendarExpenses: CalendarExpense[] = [];

    expenses.forEach(expense => {
      if (expense.is_recurring && expense.day_of_month) {
        // Monthly recurring expense - show on every month
        let dayOfMonth = expense.day_of_month;
        
        // Handle February fallback
        if (month === 1 && dayOfMonth > 28) { // February (0-indexed)
          dayOfMonth = 28;
        } else if (dayOfMonth > 30 && [3, 5, 8, 10].includes(month)) { // Apr, Jun, Sep, Nov
          dayOfMonth = 30;
        }
        
        // Create date for the current viewing month
        const expenseDate = new Date(year, month, dayOfMonth);
        
        calendarExpenses.push({
          id: `${expense.id}-${year}-${month}`,
          title: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expenseDate,
          type: 'monthly'
        });
      } else if (!expense.is_recurring) {
        // One-time expense - only show if it's in the current viewing month/year
        const expenseDate = new Date(expense.created_at);
        
        if (expenseDate.getMonth() === month && expenseDate.getFullYear() === year) {
          calendarExpenses.push({
            id: expense.id,
            title: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expenseDate,
            type: 'one-time'
          });
        }
      }
    });

    return calendarExpenses;
  }, [expenses, month, year]);
};