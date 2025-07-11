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

interface SalaryConfiguration {
  frequency: string;
  days_of_month: number[];
  quarterly_amounts: any;
}

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
  salary: SalaryConfiguration | undefined
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

      if (salary && salary.quarterly_amounts && Array.isArray(salary.quarterly_amounts)) {
        // Calculate average quarterly amount
        const quarterlyAmounts = salary.quarterly_amounts.map((q: any) => q.amount || 0);
        const totalQuarterly = quarterlyAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
        const avgQuarterly = quarterlyAmounts.length > 0 ? totalQuarterly / quarterlyAmounts.length : 0;

        if (avgQuarterly > 0) {
          // Convert to payment frequency
          switch (salary.frequency) {
            case 'weekly':
              nextIncomeAmount = avgQuarterly / 13;
              nextIncomeDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case 'biweekly':
              nextIncomeAmount = avgQuarterly / 6.5;
              nextIncomeDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              nextIncomeAmount = avgQuarterly / 3;
              const nextSalaryMonth = new Date(today.getFullYear(), today.getMonth() + 1, salary.days_of_month[0] || 1);
              nextIncomeDate = nextSalaryMonth;
              break;
            case 'yearly':
              nextIncomeAmount = avgQuarterly * 4;
              nextIncomeDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
              break;
          }
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