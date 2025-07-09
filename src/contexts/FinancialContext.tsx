
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialData';
import { getCurrencySymbol } from '@/utils/currencyUtils';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings' | 'borrow';
  amount: number;
  description: string;
  date: string;
  category?: string;
  goalId?: string;
  isReserved?: boolean;
  isExtraContribution?: boolean;
  recurring?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  recurringContribution?: number;
  contributionFrequency?: 'weekly' | 'biweekly' | 'monthly';
  icon?: string;
}

export interface SalaryConfig {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  daysOfMonth: number[];
  quarterlyAmounts: Array<{
    quarter: string;
    amount: number;
  }>;
}

interface FinancialContextType {
  // Legacy properties for backward compatibility during migration
  currency: string;
  setCurrency: (currency: string) => void;
  salary: SalaryConfig | null;
  setSalary: (salary: SalaryConfig) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  
  // Calculation functions
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getReservedExpenses: () => number;
  getFreeToSpend: () => number;
  getPendingExpenses: () => number;
  getNextIncomeAmount: () => number;
  getNextIncomeDate: () => Date | null;
  
  // Utility functions
  convertCurrency: (amount: number, targetCurrency: string) => number;
  generateSalaryTransactions: (startDate: Date, endDate: Date) => Transaction[];
  generateRecurringTransactions?: (startDate: Date, endDate: Date) => Transaction[];
  borrowFromNextIncome: (amount: number, reason: string) => void;
  addSavingsContribution: (goalId: string, amount: number, description: string, isExtra?: boolean) => void;
  getSalary: () => SalaryConfig | null;
  
  // Onboarding state
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  isCheckingOnboarding: boolean;
  isFirstTimeUser: boolean;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { data: financialProfile, isLoading: isLoadingProfile } = useFinancialProfile();
  
  // Legacy state for backward compatibility
  const [currency, setCurrency] = useState('USD');
  const [salary, setSalaryState] = useState<SalaryConfig | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding by checking if they have a financial profile
  useEffect(() => {
    if (user && !isLoadingProfile) {
      const hasProfile = !!financialProfile;
      console.log('🔍 Checking onboarding status:', { hasProfile, financialProfile });
      setHasCompletedOnboarding(hasProfile);
      
      if (hasProfile) {
        setCurrency(financialProfile.base_currency);
        setStartDate(financialProfile.start_date);
      }
    } else if (!user) {
      setHasCompletedOnboarding(false);
    }
  }, [user, financialProfile, isLoadingProfile]);

  const completeOnboarding = () => {
    console.log('✅ Marking onboarding as complete');
    setHasCompletedOnboarding(true);
  };

  // Calculation functions
  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income' || t.type === 'borrow')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getReservedExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense' && t.isReserved)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getFreeToSpend = () => {
    const totalIncome = getTotalIncome();
    const totalExpenses = getTotalExpenses();
    const assignedSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    return Math.max(0, totalIncome - totalExpenses - assignedSavings);
  };

  const getPendingExpenses = () => {
    const today = new Date();
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && transactionDate > today;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getNextIncomeAmount = () => {
    if (!salary) return 0;
    
    // Calculate average quarterly amount
    const totalQuarterly = salary.quarterlyAmounts.reduce((sum, q) => sum + q.amount, 0);
    const avgQuarterly = totalQuarterly / salary.quarterlyAmounts.length;
    
    // Convert to payment frequency
    switch (salary.frequency) {
      case 'weekly':
        return avgQuarterly / 13; // Approximately 13 weeks per quarter
      case 'biweekly':
        return avgQuarterly / 6.5; // Approximately 6.5 biweekly periods per quarter
      case 'monthly':
        return avgQuarterly / 3; // 3 months per quarter
      case 'yearly':
        return avgQuarterly * 4; // 4 quarters per year
      default:
        return 0;
    }
  };

  const getNextIncomeDate = () => {
    if (!salary) return null;
    
    const today = new Date();
    const nextDate = new Date(today);
    
    switch (salary.frequency) {
      case 'weekly':
        nextDate.setDate(today.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(today.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(today.getMonth() + 1);
        nextDate.setDate(salary.daysOfMonth[0] || 1);
        break;
      case 'yearly':
        nextDate.setFullYear(today.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  };

  const convertCurrency = (amount: number, targetCurrency: string) => {
    // Simple conversion rates (in a real app, use live rates)
    const rates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      CRC: 525,
      GBP: 0.73,
      CAD: 1.25
    };
    
    const fromRate = rates[currency] || 1;
    const toRate = rates[targetCurrency] || 1;
    
    return (amount / fromRate) * toRate;
  };

  const generateSalaryTransactions = (startDate: Date, endDate: Date): Transaction[] => {
    if (!salary) return [];
    
    const transactions: Transaction[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const amount = getNextIncomeAmount();
      if (amount > 0) {
        transactions.push({
          id: `salary-${current.getTime()}`,
          type: 'income',
          amount,
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
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    return transactions;
  };

  const borrowFromNextIncome = (amount: number, reason: string) => {
    addTransaction({
      type: 'borrow',
      amount,
      description: reason,
      date: new Date().toISOString().split('T')[0],
      category: 'advance'
    });
  };

  const addSavingsContribution = (goalId: string, amount: number, description: string, isExtra = false) => {
    addTransaction({
      type: 'savings',
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
      goalId,
      category: 'savings',
      isExtraContribution: isExtra
    });
    
    // Update goal current amount
    updateGoal(goalId, {
      currentAmount: (goals.find(g => g.id === goalId)?.currentAmount || 0) + amount
    });
  };

  const setSalary = (newSalary: SalaryConfig) => {
    setSalaryState(newSalary);
  };

  const getSalary = () => salary;

  // Legacy functions for backward compatibility
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updates } : transaction
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const value: FinancialContextType = {
    currency,
    setCurrency,
    salary,
    setSalary,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    startDate,
    setStartDate,
    getTotalIncome,
    getTotalExpenses,
    getReservedExpenses,
    getFreeToSpend,
    getPendingExpenses,
    getNextIncomeAmount,
    getNextIncomeDate,
    convertCurrency,
    generateSalaryTransactions,
    borrowFromNextIncome,
    addSavingsContribution,
    getSalary,
    hasCompletedOnboarding,
    completeOnboarding,
    isCheckingOnboarding: isLoadingProfile,
    isFirstTimeUser: !hasCompletedOnboarding,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
