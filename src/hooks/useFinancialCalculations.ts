import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  created_at: string;
}

interface Expense {
  id: string;
  amount: number;
  is_reserved: boolean;
  is_recurring: boolean;
}

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

interface FinancialProfile {
  id: string;
  base_currency: string;
}

import { SalaryData } from '@/services/salaryService';

interface FinancialCalculations {
  totalIncome: number;
  totalExpenses: number;
  reservedExpenses: number;
  assignedSavings: number;
  freeToSpend: number;
  pendingExpenses: number;
  nextIncomeAmount: number;
  nextIncomeDate: Date | null;
}

export const useFinancialCalculations = (
  transactions: Transaction[] | undefined,
  expenses: Expense[] | undefined,
  goals: SavingsGoal[] | undefined,
  profile: FinancialProfile | undefined,
  salary: SalaryData | undefined
): FinancialCalculations => {
  const [calculations, setCalculations] = useState<FinancialCalculations>({
    totalIncome: 0,
    totalExpenses: 0,
    reservedExpenses: 0,
    assignedSavings: 0,
    freeToSpend: 0,
    pendingExpenses: 0,
    nextIncomeAmount: 0,
    nextIncomeDate: null,
  });

  useEffect(() => {
    const calculateFinancials = async () => {
      if (!transactions || !expenses || !goals || !profile) {
        return;
      }

      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Calculate totals from transactions
      const totalIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date + 'T00:00:00') <= today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00') <= today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const assignedSavings = transactions
        .filter(t => t.type === 'savings' && new Date(t.date + 'T00:00:00') <= today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Calculate reserved expenses (recurring expenses for current month)
      let reservedExpenses = 0;
      try {
        const { data: recurringExpenses } = await supabase.rpc('generate_recurring_expenses', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          start_date_param: currentMonth.toISOString().split('T')[0],
          end_date_param: nextMonth.toISOString().split('T')[0]
        });

        if (recurringExpenses) {
          reservedExpenses = recurringExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
        }
      } catch (error) {
        console.error('Error calculating reserved expenses:', error);
        // Fallback to old method
        reservedExpenses = expenses
          .filter(expense => expense.is_reserved || expense.is_recurring)
          .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);
      }

      // Calculate pending expenses (future one-time expenses)
      const pendingExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00') > today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Calculate next income amount and date only if salary exists
      let nextIncomeAmount = 0;
      let nextIncomeDate: Date | null = null;

      if (salary && salary.paychecks && salary.paychecks.length > 0) {
        // Calculate average paycheck amount
        const totalPaychecks = salary.paychecks.reduce((sum, amount) => sum + amount, 0);
        const avgPaycheck = totalPaychecks / salary.paychecks.length;

        if (avgPaycheck > 0) {
          nextIncomeAmount = avgPaycheck;
          
          // Find next pay date
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          
          let nextPayDate: Date | null = null;
          
          // Check pay dates in current month first
          for (const payDate of salary.pay_dates) {
            const candidateDate = new Date(currentYear, currentMonth, payDate);
            if (candidateDate > today) {
              nextPayDate = candidateDate;
              break;
            }
          }
          
          // If no pay date found in current month, check next month
          if (!nextPayDate) {
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            nextPayDate = new Date(nextMonthYear, nextMonth, salary.pay_dates[0]);
          }
          
          nextIncomeDate = nextPayDate;
        }
      }

      // Calculate free to spend (current balance minus reserved expenses and assigned savings)
      const freeToSpend = Math.max(0, totalIncome - totalExpenses - assignedSavings - reservedExpenses - pendingExpenses);

      setCalculations({
        totalIncome,
        totalExpenses,
        reservedExpenses,
        assignedSavings,
        freeToSpend,
        pendingExpenses,
        nextIncomeAmount,
        nextIncomeDate,
      });
    };

    calculateFinancials();
  }, [transactions, expenses, goals, profile, salary]);

  return calculations;
};