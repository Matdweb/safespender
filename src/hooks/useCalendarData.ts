
import { useMemo } from 'react';
import { useTransactions } from './useFinancialData';
import { useFinancialDashboard } from './useFinancialDashboard';

export interface CalendarTransaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  date: string;
  category?: string;
  description: string;
}

export const useCalendarData = (currentDate: Date) => {
  const { data: transactions, isLoading } = useTransactions();
  const { generateSalaryTransactions, goals } = useFinancialDashboard();

  const calendarItems = useMemo(() => {
    if (!transactions) return [];

    // Get calendar view range (current month + 1 month back and 2 months forward for context)
    const startOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfRange = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);

    // Filter manual transactions for the date range
    const manualTransactionsInRange = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfRange && transactionDate <= endOfRange;
      })
      .map(t => ({
        id: t.id,
        type: t.type,
        title: t.description,
        amount: parseFloat(t.amount.toString()),
        date: t.date,
        category: t.category || undefined,
        description: t.description,
      }));

    // Generate salary transactions for the view range
    const salaryTransactions = generateSalaryTransactions(startOfRange, endOfRange);
    const salaryItems = salaryTransactions.map(t => ({
      id: t.id,
      type: t.type as 'income' | 'expense' | 'savings',
      title: t.description,
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
    }));

    // Add savings contributions as calendar items
    const savingsItems: CalendarTransaction[] = [];
    if (goals) {
      goals.forEach(goal => {
        if (goal.recurring_contribution && parseFloat(goal.recurring_contribution.toString()) > 0) {
          // Generate savings contributions for the view range
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          
          // Generate for each month in the range
          for (let monthOffset = -1; monthOffset <= 3; monthOffset++) {
            const contributionDate = new Date(currentYear, currentMonth + monthOffset, 1);
            
            // Adjust based on contribution frequency
            if (goal.contribution_frequency === 'monthly') {
              contributionDate.setDate(1);
            } else if (goal.contribution_frequency === 'biweekly') {
              contributionDate.setDate(15);
            } else if (goal.contribution_frequency === 'weekly') {
              contributionDate.setDate(7);
            }
            
            if (contributionDate >= startOfRange && contributionDate <= endOfRange) {
              savingsItems.push({
                id: `savings-${goal.id}-${contributionDate.getTime()}`,
                type: 'savings',
                title: `💰 ${goal.name} Savings`,
                amount: parseFloat(goal.recurring_contribution.toString()),
                date: `${contributionDate.getFullYear()}-${String(contributionDate.getMonth() + 1).padStart(2, '0')}-${String(contributionDate.getDate()).padStart(2, '0')}`,
                category: 'savings',
                description: `Savings contribution to ${goal.name}`,
              });
            }
          }
        }
      });
    }

    return [...manualTransactionsInRange, ...salaryItems, ...savingsItems];
  }, [transactions, currentDate, generateSalaryTransactions, goals]);

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarItems.filter(item => item.date === dateStr);
  };

  return {
    calendarItems,
    getItemsForDate,
    isLoading,
  };
};
