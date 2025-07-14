import { useMemo } from 'react';
import { useExpenses } from '@/hooks/useFinancialData';
import { useSalary } from '@/hooks/useSalary';

interface ExpenseCalculations {
  reservedExpenses: number;
  nextExpenses: ExpenseItem[];
}

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category: string;
}

export const useExpenseCalculations = (): ExpenseCalculations => {
  const { data: expenses } = useExpenses();
  const { data: salary } = useSalary();

  return useMemo(() => {
    if (!expenses) {
      return { reservedExpenses: 0, nextExpenses: [] };
    }

    const today = new Date();
    
    // Calculate next salary date
    let nextSalaryDate: Date | null = null;
    if (salary && salary.pay_dates && salary.pay_dates.length > 0) {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Check pay dates in current month first
      for (const payDate of salary.pay_dates) {
        const candidateDate = new Date(currentYear, currentMonth, payDate);
        if (candidateDate > today) {
          nextSalaryDate = candidateDate;
          break;
        }
      }
      
      // If no pay date found in current month, check next month
      if (!nextSalaryDate) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        nextSalaryDate = new Date(nextMonthYear, nextMonth, salary.pay_dates[0]);
      }
    }

    // If no salary date found, use end of current month as fallback
    if (!nextSalaryDate) {
      nextSalaryDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    const nextExpenses: ExpenseItem[] = [];
    let reservedAmount = 0;

    expenses.forEach(expense => {
      if (expense.is_recurring && expense.day_of_month) {
        // Monthly recurring expense
        let expenseDate = new Date(today.getFullYear(), today.getMonth(), expense.day_of_month);
        
        // If the date has passed this month, try next month
        if (expenseDate <= today) {
          expenseDate = new Date(today.getFullYear(), today.getMonth() + 1, expense.day_of_month);
        }
        
        // Handle day fallback for months with fewer days (like February)
        if (expenseDate.getDate() !== expense.day_of_month) {
          if (expenseDate.getMonth() === 1 && expense.day_of_month > 28) { // February
            expenseDate = new Date(expenseDate.getFullYear(), 1, 28);
          } else {
            // Use last day of the month
            expenseDate = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0);
          }
        }
        
        // Include if it's between today and next salary
        if (expenseDate > today && expenseDate <= nextSalaryDate) {
          nextExpenses.push({
            id: expense.id,
            title: expense.description,
            amount: expense.amount,
            date: expenseDate,
            category: expense.category,
          });
          reservedAmount += expense.amount;
        }
      } else if (!expense.is_recurring) {
        // One-time expense
        const expenseDate = new Date(expense.created_at);
        
        // Include if it's between today and next salary
        if (expenseDate > today && expenseDate <= nextSalaryDate) {
          nextExpenses.push({
            id: expense.id,
            title: expense.description,
            amount: expense.amount,
            date: expenseDate,
            category: expense.category,
          });
          reservedAmount += expense.amount;
        }
      }
    });

    // Sort expenses by date
    nextExpenses.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      reservedExpenses: reservedAmount,
      nextExpenses,
    };
  }, [expenses, salary]);
};