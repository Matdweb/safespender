import { useState, useEffect } from 'react';
import { useExpenseCalculations } from '@/hooks/useExpenseCalculations';
import { useSavingsCalculations } from '@/hooks/useSavingsCalculations';

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
  const { reservedExpenses: newReservedExpenses } = useExpenseCalculations();
  
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

  // Calculate next income date first to use in savings calculations
  const [nextIncomeDate, setNextIncomeDate] = useState<Date | null>(null);
  
  useEffect(() => {
    if (salary && salary.paychecks && salary.paychecks.length > 0) {
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
      
      setNextIncomeDate(nextPayDate);
    } else {
      setNextIncomeDate(null);
    }
  }, [salary]);

  const savingsCalc = useSavingsCalculations(nextIncomeDate);

  useEffect(() => {
    const calculateFinancials = async () => {
      if (!transactions || !expenses || !goals || !profile) {
        return;
      }

      const today = new Date();
      
      // Calculate totals from transactions
      const totalIncome = transactions
        .filter(t => t.type === 'income' && new Date(t.date + 'T00:00:00') <= today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00') <= today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Savings are excluded from current balance calculation
      // Current Balance = Income - Expenses (excluding savings)
      const currentBalance = totalIncome - totalExpenses;

      // Use the new expense calculation system
      const reservedExpenses = newReservedExpenses;

      // Calculate pending expenses (future one-time expenses)
      const pendingExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00') > today)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Calculate next income amount
      let nextIncomeAmount = 0;
      if (salary && salary.paychecks && salary.paychecks.length > 0) {
        const totalPaychecks = salary.paychecks.reduce((sum, amount) => sum + amount, 0);
        nextIncomeAmount = totalPaychecks / salary.paychecks.length;
      }

      // Assigned Savings = upcoming programmed contributions until next income
      const assignedSavings = savingsCalc.assignedToSavings;

      // Free to spend = Current Balance - Reserved Expenses - Assigned Savings - Pending Expenses
      const freeToSpend = Math.max(0, currentBalance - reservedExpenses - assignedSavings - pendingExpenses);

      setCalculations({
        totalIncome: currentBalance, // This represents current balance (income - expenses, excluding savings)
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
  }, [transactions, expenses, goals, profile, salary, newReservedExpenses, savingsCalc.assignedToSavings, nextIncomeDate]);

  return calculations;
};