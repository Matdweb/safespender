import { useMemo } from 'react';

interface SalaryConfiguration {
  frequency: string;
  days_of_month: number[];
  quarterly_amounts: any;
}

export const useSalaryTransactions = (salary: SalaryConfiguration | undefined) => {
  return useMemo(() => {
    return (startDate: Date, endDate: Date) => {
      if (!salary || !salary.quarterly_amounts || !Array.isArray(salary.quarterly_amounts)) {
        return [];
      }

      const transactions: any[] = [];
      
      // Calculate average quarterly amount
      const quarterlyAmounts = salary.quarterly_amounts.map((q: any) => q.amount || 0);
      const totalQuarterly = quarterlyAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
      const avgQuarterly = quarterlyAmounts.length > 0 ? totalQuarterly / quarterlyAmounts.length : 0;

      if (avgQuarterly === 0) return [];

      let paymentAmount = 0;
      switch (salary.frequency) {
        case 'weekly':
          paymentAmount = avgQuarterly / 13;
          break;
        case 'biweekly':
          paymentAmount = avgQuarterly / 6.5;
          break;
        case 'monthly':
          paymentAmount = avgQuarterly / 3;
          break;
        case 'yearly':
          paymentAmount = avgQuarterly * 4;
          break;
      }

      if (paymentAmount === 0) return [];

      // Generate salary dates based on frequency and days_of_month
      const generateSalaryDates = () => {
        const dates: Date[] = [];
        const current = new Date(startDate);
        // Move one day earlier to show transactions before they happen
        current.setDate(current.getDate() - 1);

        while (current <= endDate) {
          if (salary.frequency === 'monthly' && salary.days_of_month?.length > 0) {
            // For monthly, use specified days of month
            salary.days_of_month.forEach(day => {
              const salaryDate = new Date(current.getFullYear(), current.getMonth(), day - 1);
              if (salaryDate >= startDate && salaryDate <= endDate) {
                dates.push(new Date(salaryDate));
              }
            });
            current.setMonth(current.getMonth() + 1);
          } else if (salary.frequency === 'biweekly' && salary.days_of_month?.length >= 2) {
            // For biweekly, use two days per month
            salary.days_of_month.slice(0, 2).forEach(day => {
              const salaryDate = new Date(current.getFullYear(), current.getMonth(), day - 1);
              if (salaryDate >= startDate && salaryDate <= endDate) {
                dates.push(new Date(salaryDate));
              }
            });
            current.setMonth(current.getMonth() + 1);
          } else {
            // Default behavior
            if (current >= startDate && current <= endDate) {
              dates.push(new Date(current));
            }
            
            switch (salary.frequency) {
              case 'weekly':
                current.setDate(current.getDate() + 7);
                break;
              case 'biweekly':
                current.setDate(current.getDate() + 14);
                break;
              case 'monthly':
                current.setMonth(current.getMonth() + 1);
                break;
              case 'yearly':
                current.setFullYear(current.getFullYear() + 1);
                break;
            }
          }
        }
        return dates;
      };

      const salaryDates = generateSalaryDates();
      
      salaryDates.forEach(date => {
        transactions.push({
          id: `salary-${date.getTime()}`,
          type: 'income',
          amount: paymentAmount,
          description: 'Salary Payment',
          date: date.toISOString().split('T')[0],
          category: 'salary',
          recurring: true
        });
      });

      return transactions;
    };
  }, [salary]);
};