import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'borrow' | 'savings';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isReserved?: boolean;
  borrowedFromIncomeId?: string;
  goalId?: string;
  isExtraContribution?: boolean;
  recurring?: {
    type: 'weekly' | 'monthly' | 'biweekly';
    interval: number;
    endDate?: string;
    dayOfMonth?: number;
    occurrencesPerMonth?: number;
    daysOfMonth?: number[];
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

export interface SalaryConfig {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  daysOfMonth: number[];
  quarterlyAmounts: { quarter: string; amount: number }[];
}

interface FinancialContextType {
  transactions: Transaction[];
  goals: Goal[];
  currency: string;
  startDate: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setCurrency: (currency: string) => void;
  convertCurrency: (amount: number, toCurrency: string) => number;
  getNextIncomeAmount: () => number;
  getNextIncomeDate: () => Date | null;
  generateSalaryTransactions: (startDate: Date, endDate: Date) => Transaction[];
  generateRecurringTransactions: (startDate: Date, endDate: Date) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getReservedExpenses: () => number;
  getFreeToSpend: () => number;
  getPendingExpenses: () => number;
  isFirstTimeUser: boolean;
  completeOnboarding: () => void;
  addSavingsContribution: (goalId: string, amount: number, description: string, isExtra?: boolean) => void;
  setSalary: (salary: SalaryConfig) => void;
  getSalary: () => SalaryConfig | null;
  borrowFromNextIncome: (amount: number, reason: string) => void;
  setStartDate: (date: string) => void;
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

const getCurrentQuarter = (date: Date): string => {
  const month = date.getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
};

const getBiweeklyPaycheckType = (date: Date, salaryConfig: SalaryConfig): string => {
  // For biweekly, we need to determine if this is first or second paycheck
  // We'll use the day of month to determine this
  const dayOfMonth = date.getDate();
  const sortedDays = [...salaryConfig.daysOfMonth].sort((a, b) => a - b);
  
  // Find which payday this is
  const payDayIndex = sortedDays.findIndex(day => Math.abs(day - dayOfMonth) <= 1);
  
  // Alternate between paychecks based on month and payday
  const monthsSinceStart = date.getMonth();
  const isFirstPaycheck = (monthsSinceStart + payDayIndex) % 2 === 0;
  
  return isFirstPaycheck ? 'First Paycheck' : 'Second Paycheck';
};

const getSalaryAmountForDate = (date: Date, salary: SalaryConfig): number => {
  if (salary.frequency === 'biweekly') {
    const paycheckType = getBiweeklyPaycheckType(date, salary);
    const quarterAmount = salary.quarterlyAmounts.find(q => q.quarter === paycheckType);
    return quarterAmount?.amount || 0;
  } else if (salary.frequency === 'monthly' || salary.frequency === 'yearly') {
    const quarterAmount = salary.quarterlyAmounts.find(q => q.quarter === 'Paycheck');
    return quarterAmount?.amount || 0;
  } else {
    // Weekly or quarterly
    const quarter = getCurrentQuarter(date);
    const quarterAmount = salary.quarterlyAmounts.find(q => q.quarter === quarter);
    return quarterAmount?.amount || 0;
  }
};

export const FinancialProvider = ({ children }: FinancialProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig | null>(null);
  const [startDate, setStartDateState] = useState<string | null>(null);

  const setStartDate = (date: string) => {
    setStartDateState(date);
    localStorage.setItem('safespender-start-date', date);
  };

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

  const addSavingsContribution = (goalId: string, amount: number, description: string, isExtra: boolean = false) => {
    const savingsTransaction: Omit<Transaction, 'id'> = {
      type: 'savings',
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
      category: 'savings',
      goalId,
      isExtraContribution: isExtra
    };
    
    addTransaction(savingsTransaction);
    
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    ));
    
    console.log(`Added ${isExtra ? 'extra' : 'regular'} savings contribution: $${amount} to goal ${goalId}`);
  };

  const convertCurrency = (amount: number, toCurrency: string): number => {
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

  const getNextIncomeDate = (): Date | null => {
    if (!salaryConfig || !startDate) return null;

    const today = new Date();
    const appStartDate = new Date(startDate);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Generate next few months of salary dates starting from app start date
    for (let monthOffset = 0; monthOffset <= 12; monthOffset++) {
      const checkDate = new Date(currentYear, currentMonth + monthOffset, 1);
      
      for (const dayOfMonth of salaryConfig.daysOfMonth) {
        const salaryDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), Math.min(dayOfMonth, new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate()));
        
        // Only consider dates from app start date onward
        if (salaryDate >= appStartDate && salaryDate > today) {
          return salaryDate;
        }
      }
    }

    return null;
  };

  const getNextIncomeAmount = (): number => {
    if (!salaryConfig || !startDate) return 0;

    const nextDate = getNextIncomeDate();
    if (!nextDate) return 0;

    const salaryAmount = getSalaryAmountForDate(nextDate, salaryConfig);
    
    // Subtract any borrowed amounts from next income
    const borrowedFromNext = transactions
      .filter(t => t.type === 'borrow' && t.borrowedFromIncomeId === 'next')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return Math.max(0, salaryAmount - borrowedFromNext);
  };

  const generateSalaryTransactions = (startDate: Date, endDate: Date): Transaction[] => {
    if (!salaryConfig || !startDate) return [];

    const appStartDate = new Date(startDate);
    // Only generate transactions from app start date onward
    const effectiveStartDate = startDate < appStartDate ? appStartDate : startDate;

    console.log(`Generating salary transactions from ${effectiveStartDate.toDateString()} to ${endDate.toDateString()}`);
    
    const generated: Transaction[] = [];
    const startYear = effectiveStartDate.getFullYear();
    const startMonth = effectiveStartDate.getMonth();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    for (let year = startYear; year <= endYear; year++) {
      const monthStart = year === startYear ? startMonth : 0;
      const monthEnd = year === endYear ? endMonth : 11;

      for (let month = monthStart; month <= monthEnd; month++) {
        for (const dayOfMonth of salaryConfig.daysOfMonth) {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const validDay = Math.min(dayOfMonth, daysInMonth);
          const salaryDate = new Date(year, month, validDay);

          // Only include dates from app start date onward
          if (salaryDate >= effectiveStartDate && salaryDate >= effectiveStartDate && salaryDate <= endDate) {
            const salaryAmount = getSalaryAmountForDate(salaryDate, salaryConfig);
            
            // Only subtract borrowed amount if this is the next income
            const nextIncomeDate = getNextIncomeDate();
            let adjustedAmount = salaryAmount;
            
            if (nextIncomeDate && salaryDate.getTime() === nextIncomeDate.getTime()) {
              const borrowedFromNext = transactions
                .filter(t => t.type === 'borrow' && t.borrowedFromIncomeId === 'next')
                .reduce((sum, t) => sum + t.amount, 0);
              adjustedAmount = Math.max(0, salaryAmount - borrowedFromNext);
            }

            const generatedId = `salary-${year}-${month}-${validDay}`;
            generated.push({
              id: generatedId,
              type: 'income',
              amount: adjustedAmount,
              description: `Salary - ${salaryConfig.frequency}`,
              date: `${year}-${String(month + 1).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`,
              category: 'salary'
            });
          }
        }
      }
    }

    console.log(`Generated ${generated.length} salary transaction instances`);
    return generated;
  };

  const generateRecurringTransactions = (startDate: Date, endDate: Date): Transaction[] => {
    const recurring: Transaction[] = [];
    
    // Generate recurring expenses
    transactions
      .filter(t => t.recurring && t.type === 'expense')
      .forEach(baseTransaction => {
        if (!baseTransaction.recurring) return;
        
        const { type: recurringType, interval, dayOfMonth } = baseTransaction.recurring;
        const baseDate = new Date(baseTransaction.date);
        
        let currentDate = new Date(Math.max(startDate.getTime(), baseDate.getTime()));
        
        while (currentDate <= endDate) {
          // Generate next occurrence based on recurring type
          let nextDate = new Date(currentDate);
          
          switch (recurringType) {
            case 'weekly':
              nextDate.setDate(currentDate.getDate() + (7 * interval));
              break;
            case 'biweekly':
              nextDate.setDate(currentDate.getDate() + (14 * interval));
              break;
            case 'monthly':
              nextDate.setMonth(currentDate.getMonth() + interval);
              if (dayOfMonth) {
                nextDate.setDate(Math.min(dayOfMonth, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()));
              }
              break;
          }
          
          if (nextDate > currentDate && nextDate <= endDate) {
            recurring.push({
              ...baseTransaction,
              id: `recurring-${baseTransaction.id}-${nextDate.getTime()}`,
              date: nextDate.toISOString().split('T')[0]
            });
          }
          
          currentDate = nextDate;
          
          // Safety break to prevent infinite loops
          if (recurring.length > 100) break;
        }
      });
    
    return recurring;
  };

  const getTotalIncome = () => {
    if (!startDate) return 0;

    const today = new Date();
    const appStartDate = new Date(startDate);
    
    // Get manual income transactions from app start date to today
    const manualIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= appStartDate && new Date(t.date) <= today)
      .reduce((sum, t) => sum + t.amount, 0);

    // Get salary income from app start date to today only
    const salaryIncome = generateSalaryTransactions(appStartDate, today)
      .filter(t => new Date(t.date) <= today)
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(`Total income calculation (from ${appStartDate.toDateString()}): Manual: ${manualIncome}, Salary: ${salaryIncome}, Total: ${manualIncome + salaryIncome}`);
    return manualIncome + salaryIncome;
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
    const nextIncomeDate = getNextIncomeDate();
    
    if (!nextIncomeDate) return 0;
    
    const upcomingExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) > today && 
      new Date(t.date) <= nextIncomeDate
    );
    
    return upcomingExpenses.reduce((sum, t) => sum + t.amount, 0);
  };

  const getFreeToSpend = (): number => {
    if (!startDate) return 0;

    const today = new Date();
    const appStartDate = new Date(startDate);
    const nextIncomeDate = getNextIncomeDate();

    // Calculate income received from app start date up to today only
    const totalIncomeReceived = getTotalIncome();

    // Calculate upcoming expenses and savings until next salary (from app start date onward)
    let upcomingExpenses = 0;
    let upcomingSavings = 0;

    if (nextIncomeDate) {
      // Expenses scheduled between now and next income (from app start date onward)
      upcomingExpenses = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'expense' && 
                 transactionDate >= appStartDate &&
                 transactionDate > today && 
                 transactionDate <= nextIncomeDate;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      // Savings contributions scheduled between now and next income
      upcomingSavings = goals
        .filter(goal => goal.recurringContribution > 0)
        .reduce((goalSum, goal) => {
          const contributionsBeforeIncome = getContributionsBeforeDate(goal, today, nextIncomeDate);
          return goalSum + (contributionsBeforeIncome * goal.recurringContribution);
        }, 0);
    }

    // Include borrowed amounts as positive additions (from app start date onward)
    const totalBorrowed = transactions
      .filter(t => t.type === 'borrow' && new Date(t.date) >= appStartDate)
      .reduce((sum, t) => sum + t.amount, 0);

    // Subtract all savings contributions that have been made (from app start date onward)
    const totalSavingsContributions = transactions
      .filter(t => t.type === 'savings' && new Date(t.date) >= appStartDate)
      .reduce((sum, t) => sum + t.amount, 0);

    // Subtract total expenses that have been paid (from app start date onward)
    const totalExpensesPaid = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= appStartDate && new Date(t.date) <= today)
      .reduce((sum, t) => sum + t.amount, 0);

    const freeAmount = totalIncomeReceived - totalExpensesPaid - upcomingExpenses - upcomingSavings + totalBorrowed - totalSavingsContributions;
    
    console.log(`Free to spend calculation (from ${appStartDate.toDateString()}):
      Total income received: ${totalIncomeReceived}
      Total expenses paid: ${totalExpensesPaid}
      Upcoming expenses: ${upcomingExpenses}
      Upcoming savings: ${upcomingSavings}
      Total borrowed: ${totalBorrowed}
      Total savings contributions: ${totalSavingsContributions}
      Free amount: ${freeAmount}`);
    
    return Math.max(0, freeAmount);
  };

  const getContributionsBeforeDate = (goal: Goal, fromDate: Date, toDate: Date): number => {
    if (!goal.recurringContribution || goal.recurringContribution <= 0) return 0;
    
    const daysBetween = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (goal.contributionFrequency) {
      case 'weekly':
        return Math.floor(daysBetween / 7);
      case 'biweekly':
        return Math.floor(daysBetween / 14);
      case 'monthly':
        return Math.floor(daysBetween / 30);
      default:
        return 0;
    }
  };

  const borrowFromNextIncome = (amount: number, reason: string) => {
    // Add borrow transaction
    addTransaction({
      type: 'borrow',
      amount,
      description: reason || 'Emergency advance',
      date: new Date().toISOString().split('T')[0],
      category: 'advance',
      borrowedFromIncomeId: 'next'
    });

    console.log(`Borrowed ${amount} from next income: ${reason}`);
  };

  const completeOnboarding = () => {
    // Set start date to today when completing onboarding
    if (!startDate) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
    }
    
    setIsFirstTimeUser(false);
    localStorage.setItem('safespender-onboarded', 'true');
  };

  // Load saved data on mount
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('safespender-onboarded');
    const savedStartDate = localStorage.getItem('safespender-start-date');
    
    if (hasOnboarded) {
      setIsFirstTimeUser(false);
    }
    
    if (savedStartDate) {
      setStartDateState(savedStartDate);
    }
  }, []);

  return (
    <FinancialContext.Provider value={{
      transactions,
      goals,
      currency,
      startDate,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      setCurrency,
      convertCurrency,
      getNextIncomeAmount,
      getNextIncomeDate,
      generateSalaryTransactions,
      generateRecurringTransactions,
      getTotalIncome,
      getTotalExpenses,
      getReservedExpenses,
      getFreeToSpend,
      getPendingExpenses,
      isFirstTimeUser,
      completeOnboarding,
      addSavingsContribution,
      setSalary: setSalaryConfig,
      getSalary: () => salaryConfig,
      borrowFromNextIncome,
      setStartDate,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
