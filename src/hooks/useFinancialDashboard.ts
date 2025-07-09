
import { useMemo } from 'react';
import { useFinancialProfile, useSalaryConfiguration, useExpenses, useSavingsGoals, useTransactions } from './useFinancialData';

export const useFinancialDashboard = () => {
  const { data: profile, isLoading: isLoadingProfile } = useFinancialProfile();
  const { data: salary, isLoading: isLoadingSalary } = useSalaryConfiguration();
  const { data: expenses, isLoading: isLoadingExpenses } = useExpenses();
  const { data: goals, isLoading: isLoadingGoals } = useSavingsGoals();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();

  const isLoading = isLoadingProfile || isLoadingSalary || isLoadingExpenses || isLoadingGoals || isLoadingTransactions;

  // Calculate financial values
  const calculations = useMemo(() => {
    if (!transactions || !expenses || !goals || !profile) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        reservedExpenses: 0,
        assignedSavings: 0,
        freeToSpend: 0,
        pendingExpenses: 0,
        nextIncomeAmount: 0,
        nextIncomeDate: null as Date | null,
      };
    }

    const today = new Date();
    
    // Calculate totals from transactions
    const totalIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const assignedSavings = transactions
      .filter(t => t.type === 'savings' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Calculate reserved expenses (recurring expenses)
    const reservedExpenses = expenses
      .filter(expense => expense.is_reserved || expense.is_recurring)
      .reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0);

    // Calculate pending expenses (future one-time expenses)
    const pendingExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) > today)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Calculate next income amount and date
    let nextIncomeAmount = 0;
    let nextIncomeDate: Date | null = null;

    if (salary) {
      // Calculate average quarterly amount
      const quarterlyAmounts = Array.isArray(salary.quarterly_amounts) 
        ? salary.quarterly_amounts 
        : (salary.quarterly_amounts as any)?.map?.((q: any) => q.amount) || [];
      
      const totalQuarterly = quarterlyAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
      const avgQuarterly = quarterlyAmounts.length > 0 ? totalQuarterly / quarterlyAmounts.length : 0;

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
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, salary.days_of_month[0] || 1);
          nextIncomeDate = nextMonth;
          break;
        case 'yearly':
          nextIncomeAmount = avgQuarterly * 4;
          nextIncomeDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
          break;
      }
    }

    // Calculate free to spend
    const freeToSpend = Math.max(0, totalIncome - totalExpenses - assignedSavings - reservedExpenses - pendingExpenses);

    return {
      totalIncome,
      totalExpenses,
      reservedExpenses,
      assignedSavings,
      freeToSpend,
      pendingExpenses,
      nextIncomeAmount,
      nextIncomeDate,
    };
  }, [transactions, expenses, goals, profile]);

  // Generate salary transactions for a date range
  const generateSalaryTransactions = useMemo(() => {
    return (startDate: Date, endDate: Date) => {
      if (!salary) return [];

      const transactions: any[] = [];
      const current = new Date(startDate);

      // Calculate average quarterly amount
      const quarterlyAmounts = Array.isArray(salary.quarterly_amounts) 
        ? salary.quarterly_amounts 
        : (salary.quarterly_amounts as any)?.map?.((q: any) => q.amount) || [];
      
      const totalQuarterly = quarterlyAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
      const avgQuarterly = quarterlyAmounts.length > 0 ? totalQuarterly / quarterlyAmounts.length : 0;

      let paymentAmount = 0;
      switch (salary.frequency) {
        case 'weekly':
          paymentAmount = avgQuarterly / 13;
          break;
        case 'biweekly':
          paymentAmount = avgQuarterly / 6.5;
          break;
        case 'monthly':
          paymentAmount = avgQuarterly / 3;
          break;
        case 'yearly':
          paymentAmount = avgQuarterly * 4;
          break;
      }

      while (current <= endDate) {
        if (paymentAmount > 0) {
          transactions.push({
            id: `salary-${current.getTime()}`,
            type: 'income',
            amount: paymentAmount,
            description: 'Salary Payment',
            date: current.toISOString().split('T')[0],
            category: 'salary',
            recurring: true
          });
        }

        // Move to next payment date
        switch (salary.frequency) {
          case 'weekly':
            current.setDate(current.getDate() + 7);
            break;
          case 'biweekly':
            current.setDate(current.getDate() + 14);
            break;
          case 'monthly':
            current.setMonth(current.getMonth() + 1);
            if (salary.days_of_month && salary.days_of_month.length > 0) {
              current.setDate(salary.days_of_month[0]);
            }
            break;
          case 'yearly':
            current.setFullYear(current.getFullYear() + 1);
            break;
        }
      }

      return transactions;
    };
  }, [salary]);

  // Currency conversion (simple implementation)
  const convertCurrency = (amount: number, targetCurrency: string) => {
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      CRC: 525,
      GBP: 0.73,
      CAD: 1.25
    };
    
    const fromRate = rates[profile?.base_currency || 'USD'] || 1;
    const toRate = rates[targetCurrency] || 1;
    
    return (amount / fromRate) * toRate;
  };

  return {
    // Data
    profile,
    salary,
    expenses,
    goals,
    transactions,
    
    // Loading states
    isLoading,
    
    // Calculated values
    ...calculations,
    
    // Utility functions
    generateSalaryTransactions,
    convertCurrency,
    
    // Currency
    currency: profile?.base_currency || 'USD',
  };
};
