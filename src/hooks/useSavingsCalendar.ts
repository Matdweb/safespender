import { useMemo } from 'react';
import { useSavingsGoals } from '@/hooks/useFinancialData';

interface SavingsCalendarItem {
  id: string;
  title: string;
  amount: number;
  date: Date;
  goalId: string;
  goalIcon: string;
  type: 'programmed-contribution';
}

export const useSavingsCalendar = (month: number, year: number): SavingsCalendarItem[] => {
  const { data: goals } = useSavingsGoals();

  return useMemo(() => {
    if (!goals) return [];

    const savingsItems: SavingsCalendarItem[] = [];

    goals.forEach(goal => {
      const contribution = parseFloat(goal.recurring_contribution?.toString() || '0');
      
      // Only add programmed contributions that have an amount > 0
      if (contribution > 0) {
        // Always show on the 16th of the viewing month
        const contributionDate = new Date(year, month, 16);
        
        savingsItems.push({
          id: `savings-${goal.id}-${year}-${month}`,
          title: `${goal.name} Contribution`,
          amount: contribution,
          date: contributionDate,
          goalId: goal.id,
          goalIcon: goal.icon || '💰',
          type: 'programmed-contribution'
        });
      }
    });

    return savingsItems;
  }, [goals, month, year]);
};