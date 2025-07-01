
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
    dayOfMonth?: number;
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
  getPendingExpenses: () => number;
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

// Helper function to handle date edge cases
const getValidDayForMonth = (day: number, month: number, year: number): number => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(day, daysInMonth);
};

// Helper function to get next income date
const getNextIncomeDate = (transactions: Transaction[], fromDate: Date = new Date()): Date | null => {
  const incomeTransactions = transactions.filter(t => t.type === 'income' && t.recurring);
  if (incomeTransactions.length === 0) return null;

  let nextIncomeDate: Date | null = null;
  
  incomeTransactions.forEach(income => {
    if (!income.recurring) return;
    
    const baseDate = new Date(income.date);
    let currentDate = new Date(Math.max(baseDate.getTime(), fromDate.getTime()));
    
    // Find next occurrence
    while (currentDate <= fromDate) {
      switch (income.recurring.type) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          if (income.recurring.dayOfMonth) {
            const validDay = getValidDayForMonth(income.recurring.dayOfMonth, currentDate.getMonth(), currentDate.getFullYear());
            currentDate.setDate(validDay);
          }
          break;
      }
    }
    
    if (!nextIncomeDate || currentDate < nextIncomeDate) {
      nextIncomeDate = currentDate;
    }
  });
  
  return nextIncomeDate;
};

export const FinancialProvider = ({ children }: FinancialProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [recurringCache, setRecurringCache] = useState<Map<string, Transaction[]>>(new Map());

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
    const cacheKey = `${startDate.getTime()}-${endDate.getTime()}`;
    
    if (recurringCache.has(cacheKey)) {
      return recurringCache.get(cacheKey)!;
    }

    const generated: Transaction[] = [];
    const processedIds = new Set<string>();
    
    transactions.forEach(transaction => {
      if (!transaction.recurring || processedIds.has(transaction.id)) return;
      processedIds.add(transaction.id);
      
      const { type, interval, dayOfMonth } = transaction.recurring;
      const baseDate = new Date(transaction.date);
      let currentDate = new Date(Math.max(baseDate.getTime(), startDate.getTime()));
      
      while (currentDate <= endDate) {
        if (currentDate > baseDate) {
          let nextDate = new Date(currentDate);
          
          // Handle monthly recurring with specific day
          if (type === 'monthly' && dayOfMonth) {
            const validDay = getValidDayForMonth(dayOfMonth, nextDate.getMonth(), nextDate.getFullYear());
            nextDate.setDate(validDay);
          }
          
          const generatedId = `${transaction.id}-recurring-${nextDate.getTime()}`;
          if (!generated.find(g => g.id === generatedId)) {
            generated.push({
              ...transaction,
              id: generatedId,
              date: nextDate.toISOString().split('T')[0],
            });
          }
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
            const originalDay = dayOfMonth || currentDate.getDate();
            currentDate.setMonth(currentDate.getMonth() + interval);
            const validDay = getValidDayForMonth(originalDay, currentDate.getMonth(), currentDate.getFullYear());
            currentDate.setDate(validDay);
            break;
        }
      }
    });
    
    recurringCache.set(cacheKey, generated);
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

  const getPendingExpenses = () => {
    const today = new Date();
    const nextIncomeDate = getNextIncomeDate(transactions, today);
    
    if (!nextIncomeDate) return 0;
    
    // Get all expenses between now and next income
    const recurringExpenses = generateRecurringTransactions(today, nextIncomeDate);
    const upcomingExpenses = recurringExpenses.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) >= today && 
      new Date(t.date) <= nextIncomeDate
    );
    
    return upcomingExpenses.reduce((sum, t) => sum + t.amount, 0);
  };

  const getFreeToSpend = () => {
    const today = new Date();
    const nextIncomeDate = getNextIncomeDate(transactions, today);
    
    // Get income received up to today
    const allTransactions = [...transactions, ...generateRecurringTransactions(new Date(today.getFullYear(), 0, 1), today)];
    const incomeToDate = allTransactions
      .filter(t => t.type === 'income' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Get expenses between last income and next income (or end of period)
    const endDate = nextIncomeDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const periodExpenses = getPendingExpenses();
    
    // Get savings allocated
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
    return incomeToDate - periodExpenses - totalSavings;
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

  // Clear cache when transactions change
  useEffect(() => {
    setRecurringCache(new Map());
  }, [transactions]);

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
      getPendingExpenses,
      isFirstTimeUser,
      completeOnboarding,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
