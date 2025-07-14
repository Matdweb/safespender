import { useMemo } from 'react';

import { SalaryData } from '@/services/salaryService';

export const useSalaryTransactions = (salary: SalaryData | undefined) => {
  return useMemo(() => {
    return (startDate: Date, endDate: Date) => {
      if (!salary || !salary.paychecks || salary.paychecks.length === 0) {
        return [];
      }

      const transactions: any[] = [];
      
      // Generate transactions for each pay date and paycheck pair
      salary.pay_dates.forEach((payDate, index) => {
        const paycheck = salary.paychecks[index] || 0;
        if (paycheck <= 0) return;

        // Generate salary dates based on schedule
        const current = new Date(startDate);
        
        while (current <= endDate) {
          const currentMonth = current.getMonth();
          const currentYear = current.getFullYear();
          
          // Adjust pay date for February (or other months with fewer days)
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const adjustedPayDate = payDate > daysInMonth ? daysInMonth : payDate;
          
          const salaryDate = new Date(currentYear, currentMonth, adjustedPayDate);
          
          if (salaryDate >= startDate && salaryDate <= endDate) {
            transactions.push({
              id: `salary-${salary.id}-${salaryDate.getTime()}`,
              type: 'income',
              amount: paycheck,
              description: 'Salary Payment',
              date: salaryDate.toISOString().split('T')[0],
              category: 'salary',
              recurring: true
            });
          }
          
          // Move to next month for monthly schedule
          // (biweekly and yearly schedules would need different logic)
          current.setMonth(current.getMonth() + 1);
        }
      });

      return transactions;
    };
  }, [salary]);
};