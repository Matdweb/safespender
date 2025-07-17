import { useState, useEffect } from 'react';
import { useExpenses, useTransactions, useSavingsGoals, useFinancialProfile } from '@/hooks/useFinancialData';
import { useSalary } from '@/hooks/useSalary';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedFreeToSpendCalculations {
  totalIncome: number;
  reservedForBills: number;
  assignedToSavings: number;
  freeToSpend: number;
  currentBalance: number;
  isLoading: boolean;
}

export const useUnifiedFreeToSpend = (): UnifiedFreeToSpendCalculations => {
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: goals, isLoading: goalsLoading } = useSavingsGoals();
  const { data: profile, isLoading: profileLoading } = useFinancialProfile();
  const { data: salary, isLoading: salaryLoading } = useSalary();

  const [calculations, setCalculations] = useState<UnifiedFreeToSpendCalculations>({
    totalIncome: 0,
    reservedForBills: 0,
    assignedToSavings: 0,
    freeToSpend: 0,
    currentBalance: 0,
    isLoading: true,
  });

  const isLoading = expensesLoading || transactionsLoading || goalsLoading || profileLoading || salaryLoading;

  useEffect(() => {
    const calculateFinancials = async () => {
      if (isLoading || !expenses || !transactions || !goals || !profile) {
        setCalculations(prev => ({ ...prev, isLoading }));
        return;
      }

      const today = new Date();
      const startDate = new Date(profile.start_date + 'T00:00:00');
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const currentMonthStart = new Date(currentYear, currentMonth, 1);

      // ✅ Reserved for Bills: Current month expenses with date <= today
      let reservedForBills = 0;

      // From manual transactions (one-time expenses)
      const currentMonthExpenses = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date + 'T00:00:00') >= currentMonthStart &&
        new Date(t.date + 'T00:00:00') <= today
      );
      reservedForBills += currentMonthExpenses.reduce((sum, t) => 
        sum + parseFloat(t.amount.toString()), 0
      );

      // From recurring expenses using RPC
      try {
        const { data: recurringExpenses } = await supabase.rpc('generate_recurring_expenses', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          start_date_param: currentMonthStart.toISOString().split('T')[0],
          end_date_param: today.toISOString().split('T')[0]
        });

        if (recurringExpenses) {
          reservedForBills += recurringExpenses.reduce((sum, expense) => 
            sum + parseFloat(expense.amount.toString()), 0
          );
        }
      } catch (error) {
        console.error('Error calculating recurring expenses:', error);
      }

      // ✅ Assigned to Savings: Monthly contributions for current month
      const assignedToSavings = goals?.reduce((sum, goal) => {
        if (goal.contribution_frequency === 'monthly' && goal.recurring_contribution) {
          return sum + parseFloat(goal.recurring_contribution.toString());
        }
        return sum;
      }, 0) || 0;

      // ✅ Income Received: All income since start date
      let totalIncome = 0;

      // From salary
      if (salary && salary.paychecks && salary.pay_dates) {
        const avgPaycheck = salary.paychecks.reduce((sum, amount) => sum + amount, 0) / salary.paychecks.length;
        
        let checkDate = new Date(startDate);
        while (checkDate <= today) {
          for (const payDate of salary.pay_dates) {
            const salaryDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), payDate);
            if (salaryDate >= startDate && salaryDate <= today) {
              totalIncome += avgPaycheck;
            }
          }
          checkDate.setMonth(checkDate.getMonth() + 1);
          checkDate.setDate(1);
        }
      }

      // From manual income transactions
      const incomeTransactions = transactions.filter(t => 
        t.type === 'income' && 
        new Date(t.date + 'T00:00:00') <= today
      );
      totalIncome += incomeTransactions.reduce((sum, t) => 
        sum + parseFloat(t.amount.toString()), 0
      );

      // ✅ Current Balance: All income - all expenses since start date
      const allExpenseTransactions = transactions.filter(t => 
        t.type === 'expense' && 
        new Date(t.date + 'T00:00:00') <= today
      );
      const totalExpensesFromTransactions = allExpenseTransactions.reduce((sum, t) => 
        sum + parseFloat(t.amount.toString()), 0
      );

      // Add all recurring expenses that occurred since start date
      let totalRecurringExpenses = 0;
      try {
        const { data: allRecurringExpenses } = await supabase.rpc('generate_recurring_expenses', {
          user_id_param: (await supabase.auth.getUser()).data.user?.id,
          start_date_param: startDate.toISOString().split('T')[0],
          end_date_param: today.toISOString().split('T')[0]
        });

        if (allRecurringExpenses) {
          totalRecurringExpenses = allRecurringExpenses.reduce((sum, expense) => 
            sum + parseFloat(expense.amount.toString()), 0
          );
        }
      } catch (error) {
        console.error('Error calculating total recurring expenses:', error);
      }

      const currentBalance = totalIncome - totalExpensesFromTransactions - totalRecurringExpenses;

      // ✅ Free to Spend: Current Balance - Reserved Bills - Assigned Savings
      // Special case: If today is before the 16th, subtract monthly savings for this month
      let adjustedAssignedSavings = assignedToSavings;
      if (today.getDate() < 16) {
        adjustedAssignedSavings = assignedToSavings;
      } else {
        adjustedAssignedSavings = 0; // Savings already allocated
      }

      const freeToSpend = Math.max(0, currentBalance - reservedForBills - adjustedAssignedSavings);

      setCalculations({
        totalIncome,
        reservedForBills,
        assignedToSavings: adjustedAssignedSavings,
        freeToSpend,
        currentBalance,
        isLoading: false,
      });
    };

    calculateFinancials();
  }, [expenses, transactions, goals, profile, salary, isLoading]);

  return calculations;
};