
import { SalaryConfig } from '@/contexts/FinancialContext';

// Test utility to validate salary calculations
export const testSalaryCalculations = (salaryConfig: SalaryConfig) => {
  console.log('🧪 Testing Salary Configuration:', salaryConfig);
  
  const today = new Date();
  const testStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const testEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
  
  console.log(`Test period: ${testStartDate.toDateString()} to ${testEndDate.toDateString()}`);
  
  const expectedTransactions = [];
  
  // Generate expected salary dates
  for (let month = 0; month < 3; month++) {
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + month, 1);
    
    for (const dayOfMonth of salaryConfig.daysOfMonth) {
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const validDay = Math.min(dayOfMonth, daysInMonth);
      const salaryDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), validDay);
      
      if (salaryDate >= testStartDate && salaryDate <= testEndDate) {
        let expectedAmount = 0;
        
        if (salaryConfig.frequency === 'biweekly') {
          // For biweekly, alternate between quarters
          const monthsSinceStart = salaryDate.getMonth() - today.getMonth();
          const payDayIndex = salaryConfig.daysOfMonth.indexOf(dayOfMonth);
          const isFirstPaycheck = (monthsSinceStart + payDayIndex) % 2 === 0;
          const quarterKey = isFirstPaycheck ? 'First Paycheck' : 'Second Paycheck';
          const quarterAmount = salaryConfig.quarterlyAmounts.find(q => q.quarter === quarterKey);
          expectedAmount = quarterAmount?.amount || 0;
        } else if (salaryConfig.frequency === 'monthly') {
          const quarterAmount = salaryConfig.quarterlyAmounts.find(q => q.quarter === 'Paycheck');
          expectedAmount = quarterAmount?.amount || 0;
        }
        
        expectedTransactions.push({
          date: salaryDate.toISOString().split('T')[0],
          amount: expectedAmount,
          description: `Expected ${salaryConfig.frequency} salary`
        });
      }
    }
  }
  
  console.log('📊 Expected Salary Transactions:', expectedTransactions);
  
  // Calculate expected monthly total
  const monthlyTotal = expectedTransactions.reduce((sum, t) => sum + t.amount, 0);
  console.log(`💰 Expected total for 3 months: $${monthlyTotal}`);
  
  return {
    expectedTransactions,
    monthlyTotal,
    testPeriod: { start: testStartDate, end: testEndDate }
  };
};

export const validateFreeToSpendCalculation = (
  totalIncomeReceived: number,
  totalExpensesPaid: number,
  upcomingExpenses: number,
  upcomingSavings: number,
  totalBorrowed: number,
  totalSavingsContributions: number
) => {
  const calculatedFreeToSpend = totalIncomeReceived - totalExpensesPaid - upcomingExpenses - upcomingSavings + totalBorrowed - totalSavingsContributions;
  
  console.log('🧮 Free to Spend Validation:');
  console.log(`Income received: $${totalIncomeReceived}`);
  console.log(`Expenses paid: $${totalExpensesPaid}`);
  console.log(`Upcoming expenses: $${upcomingExpenses}`);
  console.log(`Upcoming savings: $${upcomingSavings}`);
  console.log(`Total borrowed: $${totalBorrowed}`);
  console.log(`Savings contributions: $${totalSavingsContributions}`);
  console.log(`Calculated Free to Spend: $${Math.max(0, calculatedFreeToSpend)}`);
  
  return Math.max(0, calculatedFreeToSpend);
};
