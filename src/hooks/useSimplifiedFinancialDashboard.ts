import { useMemo } from 'react';
import { useTransactions, useExpenses, useSavingsGoals } from './useFinancialData';
import { useSalary } from './useSalary';
import { generateSalaryTransactions } from '@/services/salaryService';

export const useSimplifiedFinancialDashboard = () => {
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { data: expenses, isLoading: isLoadingExpenses } = useExpenses();
  const { data: goals, isLoading: isLoadingGoals } = useSavingsGoals();
  const { data: salary, isLoading: isLoadingSalary } = useSalary();

  const isLoading = isLoadingTransactions || isLoadingExpenses || isLoadingGoals || isLoadingSalary;

  const calculations = useMemo(() => {
    if (!transactions || !expenses || !goals) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        reservedExpenses: 0,
        assignedSavings: 0,
        freeToSpend: 0,
      };
    }

    const today = new Date();
    
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

    // Calculate reserved expenses from recurring expenses
    const reservedExpenses = expenses
      .filter(expense => expense.is_reserved || expense.is_recurring)
      .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

    // Calculate free to spend
    const freeToSpend = Math.max(0, totalIncome - totalExpenses - assignedSavings - reservedExpenses);

    return {
      totalIncome,
      totalExpenses,
      reservedExpenses,
      assignedSavings,
      freeToSpend,
    };
  }, [transactions, expenses, goals]);

  const generateSalaryTransactionsForRange = (startDate: Date, endDate: Date) => {
    if (!salary) return [];
    return generateSalaryTransactions(salary, startDate, endDate);
  };

  return {
    // Data
    transactions,
    expenses,
    goals,
    salary,
    
    // Loading states
    isLoading,
    
    // Calculated values
    ...calculations,
    
    // Utility functions
    generateSalaryTransactions: generateSalaryTransactionsForRange,
    
    // Currency (default to USD)
    currency: 'USD',
  };
};