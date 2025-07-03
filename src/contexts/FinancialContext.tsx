import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'borrow';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isReserved?: boolean;
  borrowedFromIncomeId?: string;
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

export interface BorrowedAmount {
  id: string;
  amount: number;
  reason: string;
  date: string;
  repaidFromIncomeId?: string;
}

interface FinancialContextType {
  transactions: Transaction[];
  goals: Goal[];
  borrowedAmounts: BorrowedAmount[];
  currency: string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addBorrowedAmount: (amount: number, reason: string) => void;
  setBorrowedAmounts: (amounts: BorrowedAmount[]) => void;
  setCurrency: (currency: string) => void;
  convertCurrency: (amount: number, toCurrency: string) => number;
  getNextIncomeAmount: () => number;
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
  const [borrowedAmounts, setBorrowedAmounts] = useState<BorrowedAmount[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [recurringCache, setRecurringCache] = useState<Map<string, Transaction[]>>(new Map());

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    console.log('Adding transaction:', newTransaction.description, newTransaction.amount, newTransaction.type);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTransaction = (id: string) => {
    console.log('Deleting transaction:', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    console.log('Adding goal:', newGoal.name, newGoal.targetAmount);
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

  const addBorrowedAmount = (amount: number, reason: string) => {
    // Add as a transaction instead of separate borrowed amount
    const borrowTransaction: Omit<Transaction, 'id'> = {
      type: 'borrow',
      amount,
      description: reason || 'Emergency advance',
      date: new Date().toISOString().split('T')[0],
      category: 'advance'
    };
    
    addTransaction(borrowTransaction);
    
    // Also keep the old system for backwards compatibility
    const newBorrow: BorrowedAmount = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount,
      reason,
      date: new Date().toISOString().split('T')[0],
    };
    setBorrowedAmounts(prev => [...prev, newBorrow]);
  };

  const convertCurrency = (amount: number, toCurrency: string): number => {
    // Placeholder exchange rates - in production, this would fetch real rates
    const exchangeRates: { [key: string]: number } = {
      USD: 1,
      EUR: 0.85,
      CRC: 520,
      GBP: 0.73,
      CAD: 1.25,
    };

    const fromRate = exchangeRates[currency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    return Math.round((amount / fromRate) * toRate);
  };

  const getNextIncomeAmount = (): number => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months ahead
    
    const recurringIncomes = generateRecurringTransactions(today, futureDate)
      .filter(t => t.type === 'income' && new Date(t.date) > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return recurringIncomes.length > 0 ? recurringIncomes[0].amount : 0;
  };

  const generateRecurringTransactions = (startDate: Date, endDate: Date): Transaction[] => {
    const cacheKey = `${startDate.getTime()}-${endDate.getTime()}-${transactions.length}`;
    
    if (recurringCache.has(cacheKey)) {
      const cached = recurringCache.get(cacheKey)!;
      console.log(`Using cached recurring transactions: ${cached.length} items`);
      return cached;
    }

    console.log(`Generating recurring transactions from ${startDate.toDateString()} to ${endDate.toDateString()}`);
    
    const generated: Transaction[] = [];
    const recurringTransactions = transactions.filter(t => t.recurring && t.type !== 'borrow'); // Don't make borrowed amounts recurring
    
    console.log(`Found ${recurringTransactions.length} base recurring transactions`);
    
    recurringTransactions.forEach(transaction => {
      const { type, interval, dayOfMonth } = transaction.recurring!;
      const baseDate = new Date(transaction.date);
      
      let currentDate = new Date(Math.max(baseDate.getTime(), startDate.getTime()));
      
      if (dayOfMonth && type === 'monthly') {
        const validDay = getValidDayForMonth(dayOfMonth, currentDate.getMonth(), currentDate.getFullYear());
        currentDate.setDate(validDay);
        
        if (currentDate < startDate) {
          currentDate.setMonth(currentDate.getMonth() + 1);
          const nextValidDay = getValidDayForMonth(dayOfMonth, currentDate.getMonth(), currentDate.getFullYear());
          currentDate.setDate(nextValidDay);
        }
      }
      
      let iterationCount = 0;
      const maxIterations = 100;
      
      while (currentDate <= endDate && iterationCount < maxIterations) {
        if (currentDate >= startDate && currentDate > baseDate) {
          const generatedId = `${transaction.id}-recurring-${currentDate.getTime()}`;
          if (!generated.find(g => g.id === generatedId)) {
            // Adjust amount if this income has borrowed amounts against it
            let adjustedAmount = transaction.amount;
            if (transaction.type === 'income') {
              const borrowedAgainstThis = transactions
                .filter(t => t.type === 'borrow' && t.borrowedFromIncomeId === transaction.id)
                .reduce((sum, t) => sum + t.amount, 0);
              adjustedAmount = Math.max(0, transaction.amount - borrowedAgainstThis);
            }
            
            generated.push({
              ...transaction,
              id: generatedId,
              amount: adjustedAmount,
              date: currentDate.toISOString().split('T')[0],
            });
          }
        }
        
        const nextDate = new Date(currentDate);
        switch (type) {
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + (7 * interval));
            break;
          case 'biweekly':
            nextDate.setDate(nextDate.getDate() + (14 * interval));
            break;
          case 'monthly':
            const originalDay = dayOfMonth || nextDate.getDate();
            nextDate.setMonth(nextDate.getMonth() + interval);
            const validDay = getValidDayForMonth(originalDay, nextDate.getMonth(), nextDate.getFullYear());
            nextDate.setDate(validDay);
            break;
        }
        currentDate = nextDate;
        iterationCount++;
      }
      
      if (iterationCount >= maxIterations) {
        console.warn(`Max iterations reached for transaction: ${transaction.description}`);
      }
    });
    
    console.log(`Generated ${generated.length} recurring transaction instances`);
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
    
    const allTransactions = [...transactions, ...generateRecurringTransactions(new Date(today.getFullYear(), 0, 1), today)];
    const incomeToDate = allTransactions
      .filter(t => t.type === 'income' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const endDate = nextIncomeDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const periodExpenses = getPendingExpenses();
    
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
    // Include borrowed amounts as positive additions
    const totalBorrowed = transactions
      .filter(t => t.type === 'borrow')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return incomeToDate - periodExpenses - totalSavings + totalBorrowed;
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
    console.log('Transactions changed, clearing recurring cache');
    setRecurringCache(new Map());
  }, [transactions]);

  return (
    <FinancialContext.Provider value={{
      transactions,
      goals,
      borrowedAmounts,
      currency,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addBorrowedAmount,
      setBorrowedAmounts,
      setCurrency,
      convertCurrency,
      getNextIncomeAmount,
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
