import { useMemo } from 'react';
import { useSavingsGoals } from '@/hooks/useFinancialData';

interface SavingsCalculations {
  totalSavingsBalance: number;
  assignedToSavings: number;
  programmedContributionsThisPeriod: number;
}

interface SavingsGoal {
  id: string;
  recurring_contribution: number | null;
  current_amount: number;
}

export const useSavingsCalculations = (nextIncomeDate: Date | null): SavingsCalculations => {
  const { data: goals } = useSavingsGoals();

  return useMemo(() => {
    if (!goals) {
      return {
        totalSavingsBalance: 0,
        assignedToSavings: 0,
        programmedContributionsThisPeriod: 0,
      };
    }

    // Total current balance in all savings goals
    const totalSavingsBalance = goals.reduce((sum, goal) => {
      return sum + parseFloat(goal.current_amount.toString());
    }, 0);

    // Calculate programmed contributions between now and next income
    const today = new Date();
    let programmedContributionsThisPeriod = 0;

    if (nextIncomeDate) {
      // Check if the 16th falls between today and next income date
      const contributionDay = 16;
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Create the 16th date for current month
      const contributionDate = new Date(currentYear, currentMonth, contributionDay);
      
      // If today is before the 16th and next income is after the 16th, include contributions
      if (today <= contributionDate && nextIncomeDate >= contributionDate) {
        programmedContributionsThisPeriod = goals.reduce((sum, goal) => {
          const contribution = parseFloat(goal.recurring_contribution?.toString() || '0');
          return sum + contribution;
        }, 0);
      }
    }

    return {
      totalSavingsBalance,
      assignedToSavings: programmedContributionsThisPeriod,
      programmedContributionsThisPeriod,
    };
  }, [goals, nextIncomeDate]);
};