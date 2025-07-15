
import { useFinancialProfile, useExpenses, useSavingsGoals, useTransactions } from './useFinancialData';
import { useSalary } from './useSalary';
import { useFinancialCalculations } from './useFinancialCalculations';
import { useSalaryTransactions } from './useSalaryTransactions';

export const useFinancialDashboard = () => {
  const { data: profile, isLoading: isLoadingProfile } = useFinancialProfile();
  const { data: salary, isLoading: isLoadingSalary } = useSalary();
  const { data: expenses, isLoading: isLoadingExpenses } = useExpenses();
  const { data: goals, isLoading: isLoadingGoals } = useSavingsGoals();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();

  const isLoading = isLoadingProfile || isLoadingSalary || isLoadingExpenses || isLoadingGoals || isLoadingTransactions;

  // Use separated calculation and salary transaction hooks
  const calculations = useFinancialCalculations(transactions, expenses, goals, profile, salary);
  const generateSalaryTransactions = useSalaryTransactions(salary);
  
  // Calculate total savings balance from goals
  const totalSavingsBalance = goals?.reduce((sum, goal) => {
    return sum + parseFloat(goal.current_amount.toString());
  }, 0) || 0;

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
    convertCurrency: (amount: number, targetCurrency: string) => {
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
    },
    
    // Currency
    currency: profile?.base_currency || 'USD',
    
    // Savings
    totalSavingsBalance,
  };
};
