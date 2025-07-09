import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useFinancialProfile } from '@/hooks/useFinancialData';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  description: string;
  date: string;
  category?: string;
  goalId?: string;
  isReserved?: boolean;
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

interface FinancialContextType {
  // Legacy properties for backward compatibility during migration
  currency: string;
  setCurrency: (currency: string) => void;
  salary: any;
  setSalary: (salary: any) => void;
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
  
  // Onboarding state
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  isCheckingOnboarding: boolean;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { data: financialProfile, isLoading: isLoadingProfile } = useFinancialProfile();
  
  // Legacy state for backward compatibility
  const [currency, setCurrency] = useState('USD');
  const [salary, setSalary] = useState<any>(null);
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
    hasCompletedOnboarding,
    completeOnboarding,
    isCheckingOnboarding: isLoadingProfile,
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
