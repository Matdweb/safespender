import { useState, useEffect } from 'react';
import { useExpenses, useTransactions, useSavingsGoals, useFinancialProfile } from '@/hooks/useFinancialData';
import { useSalary } from '@/hooks/useSalary';

interface AccurateFreeToSpendCalculations {
  totalIncome: number;
  reservedForBills: number;
  assignedToSavings: number;
  freeToSpend: number;
  currentBalance: number;
  lastSalaryDate: Date | null;
  nextIncomeAmount: number;
  nextIncomeDate: Date | null;
  isLoading: boolean;
}

export const useAccurateFreeToSpend = (): AccurateFreeToSpendCalculations => {
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: goals, isLoading: goalsLoading } = useSavingsGoals();
  const { data: profile, isLoading: profileLoading } = useFinancialProfile();
  const { data: salary, isLoading: salaryLoading } = useSalary();

  const [calculations, setCalculations] = useState<AccurateFreeToSpendCalculations>({
    totalIncome: 0,
    reservedForBills: 0,
    assignedToSavings: 0,
    freeToSpend: 0,
    currentBalance: 0,
    lastSalaryDate: null,
    nextIncomeAmount: 0,
    nextIncomeDate: null,
    isLoading: true,
  });

  const isLoading = expensesLoading || transactionsLoading || goalsLoading || profileLoading || salaryLoading;

  useEffect(() => {
    if (isLoading || !expenses || !transactions || !goals || !profile) {
      setCalculations(prev => ({ ...prev, isLoading }));
      return;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today for comparisons

    // Step 1: Get Income Until Today
    let totalIncome = 0;
    let lastSalaryDate: Date | null = null;

    // From salary table - get all paycheck dates before or equal to today
    if (salary && salary.paychecks && salary.pay_dates) {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Check salary dates from beginning of year until today
      for (let month = 0; month <= currentMonth; month++) {
        for (const payDate of salary.pay_dates) {
          const salaryDate = new Date(currentYear, month, payDate);
          
          if (salaryDate <= today) {
            // Calculate average paycheck amount
            const avgPaycheck = salary.paychecks.reduce((sum, amount) => sum + amount, 0) / salary.paychecks.length;
            totalIncome += avgPaycheck;
            
            // Track the most recent salary date
            if (!lastSalaryDate || salaryDate > lastSalaryDate) {
              lastSalaryDate = salaryDate;
            }
          }
        }
      }
    }

    // From transactions table - get all one-time incomes with date <= today
    const oneTimeIncomes = transactions.filter(t => 
      t.type === 'income' && 
      new Date(t.date + 'T00:00:00') <= today
    );
    
    const oneTimeIncomeTotal = oneTimeIncomes.reduce((sum, t) => 
      sum + parseFloat(t.amount.toString()), 0
    );
    
    totalIncome += oneTimeIncomeTotal;

    // Step 2: Last Programmed Salary Date is already calculated above

    // Step 3: Get Expenses After Last Income
    let reservedForBills = 0;
    
    if (lastSalaryDate) {
      // Get expenses between last salary date and today
      const expensesAfterLastSalary = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date + 'T00:00:00') >= lastSalaryDate! &&
        new Date(t.date + 'T00:00:00') <= today
      );
      
      reservedForBills = expensesAfterLastSalary.reduce((sum, t) => 
        sum + parseFloat(t.amount.toString()), 0
      );

      // Add programmed expenses that should have occurred
      const programmedExpenses = expenses.filter(expense => {
        if (!expense.is_recurring || !expense.day_of_month) return false;
        
        // Check if this programmed expense should have occurred between last salary and today
        const expenseDay = expense.day_of_month;
        let checkDate = new Date(lastSalaryDate!);
        
        while (checkDate <= today) {
          const expenseDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), expenseDay);
          
          if (expenseDate >= lastSalaryDate! && expenseDate <= today) {
            return true;
          }
          
          // Move to next month
          checkDate.setMonth(checkDate.getMonth() + 1);
          checkDate.setDate(1);
        }
        
        return false;
      });

      const programmedExpenseTotal = programmedExpenses.reduce((sum, expense) => {
        // Count how many times this expense occurred between last salary and today
        const expenseDay = expense.day_of_month!;
        let checkDate = new Date(lastSalaryDate!);
        let occurrences = 0;
        
        while (checkDate <= today) {
          const expenseDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), expenseDay);
          
          if (expenseDate >= lastSalaryDate! && expenseDate <= today) {
            occurrences++;
          }
          
          checkDate.setMonth(checkDate.getMonth() + 1);
          checkDate.setDate(1);
        }
        
        return sum + (expense.amount * occurrences);
      }, 0);

      reservedForBills += programmedExpenseTotal;
    }

    // Step 4: Get Savings Contributions
    let assignedToSavings = 0;
    
    if (lastSalaryDate && goals) {
      // Check if 16th has passed since last salary
      const today16th = new Date(today.getFullYear(), today.getMonth(), 16);
      
      if (today >= today16th && today16th >= lastSalaryDate) {
        // Include programmed savings contributions
        assignedToSavings = goals.reduce((sum, goal) => {
          const contribution = parseFloat(goal.recurring_contribution?.toString() || '0');
          return sum + contribution;
        }, 0);
      }
    }

    // Calculate current balance (all income - all expenses, regardless of savings)
    const allExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date + 'T00:00:00') <= today)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const currentBalance = totalIncome - allExpenses;

    // Step 5: Final Formula
    const freeToSpend = Math.max(0, totalIncome - reservedForBills - assignedToSavings);

    // Calculate next income
    let nextIncomeAmount = 0;
    let nextIncomeDate: Date | null = null;
    
    if (salary && salary.paychecks && salary.pay_dates) {
      const avgPaycheck = salary.paychecks.reduce((sum, amount) => sum + amount, 0) / salary.paychecks.length;
      nextIncomeAmount = avgPaycheck;
      
      // Find next pay date
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Check remaining dates in current month
      for (const payDate of salary.pay_dates) {
        const candidateDate = new Date(currentYear, currentMonth, payDate);
        if (candidateDate > today) {
          nextIncomeDate = candidateDate;
          break;
        }
      }
      
      // If no date found in current month, check next month
      if (!nextIncomeDate) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        nextIncomeDate = new Date(nextYear, nextMonth, salary.pay_dates[0]);
      }
    }

    setCalculations({
      totalIncome,
      reservedForBills,
      assignedToSavings,
      freeToSpend,
      currentBalance,
      lastSalaryDate,
      nextIncomeAmount,
      nextIncomeDate,
      isLoading: false,
    });

  }, [expenses, transactions, goals, profile, salary, isLoading]);

  return calculations;
};