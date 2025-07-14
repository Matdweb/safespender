import React from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  description: string;
  date: string;
  category?: string;
  created_at: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

interface SalaryData {
  id: string;
  schedule: 'monthly' | 'biweekly' | 'yearly';
  pay_dates: number[];
  paychecks: number[];
}

interface UpcomingEvent {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  recurring: boolean;
}

export const useUpcomingEvents = (
  transactions: Transaction[] | undefined,
  goals: SavingsGoal[] | undefined,
  salary: SalaryData | undefined,
  generateSalaryTransactions: (startDate: Date, endDate: Date) => any[]
): UpcomingEvent[] => {
  return React.useMemo(() => {
    if (!transactions || !goals) return [];
    
    const events: UpcomingEvent[] = [];
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    // Only generate salary transactions if salary data exists
    if (salary && salary.pay_dates && salary.paychecks) {
      const salaryTransactions = generateSalaryTransactions(now, nextMonth);
      events.push(
        ...salaryTransactions.slice(0, 3).map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          title: t.description,
          amount: t.amount,
          date: t.date,
          recurring: true
        }))
      );
    }
    
    // Add future transactions
    events.push(
      ...transactions
        .filter(t => new Date(t.date) > now)
        .slice(0, 3)
        .map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          title: t.description,
          amount: parseFloat(t.amount.toString()),
          date: t.date,
          recurring: false
        }))
    );
    
    return events;
  }, [transactions, goals, generateSalaryTransactions, salary]);
};