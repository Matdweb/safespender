
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isReserved?: boolean;
  recurring?: {
    type: 'weekly' | 'monthly' | 'biweekly';
    interval: number;
    endDate?: string;
  };
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  recurringContribution: number;
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly';
  icon?: string;
  createdAt: string;
}

interface FinancialContextType {
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  generateRecurringTransactions: (startDate: Date, endDate: Date) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getReservedExpenses: () => number;
  getFreeToSpend: () => number;
  isFirstTimeUser: boolean;
  completeOnboarding: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider = ({ children }: FinancialProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, ...updates } : g
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const generateRecurringTransactions = (startDate: Date, endDate: Date): Transaction[] => {
    const generated: Transaction[] = [];
    
    transactions.forEach(transaction => {
      if (!transaction.recurring) return;
      
      const { type, interval } = transaction.recurring;
      const baseDate = new Date(transaction.date);
      let currentDate = new Date(Math.max(baseDate.getTime(), startDate.getTime()));
      
      while (currentDate <= endDate) {
        if (currentDate > baseDate) {
          generated.push({
            ...transaction,
            id: `${transaction.id}-recurring-${currentDate.getTime()}`,
            date: currentDate.toISOString().split('T')[0],
          });
        }
        
        // Calculate next occurrence
        switch (type) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (7 * interval));
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + (14 * interval));
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + interval);
            break;
        }
      }
    });
    
    return generated;
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
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
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    return totalIncome - totalExpenses - totalSavings;
  };

  const completeOnboarding = () => {
    setIsFirstTimeUser(false);
    localStorage.setItem('safespender-onboarded', 'true');
  };

  // Check if user has completed onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('safespender-onboarded');
    if (hasOnboarded) {
      setIsFirstTimeUser(false);
    }
  }, []);

  return (
    <FinancialContext.Provider value={{
      transactions,
      goals,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      generateRecurringTransactions,
      getTotalIncome,
      getTotalExpenses,
      getReservedExpenses,
      getFreeToSpend,
      isFirstTimeUser,
      completeOnboarding,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
