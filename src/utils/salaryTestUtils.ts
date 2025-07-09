
import { SalaryConfig } from '@/contexts/FinancialContext';

export const testSalaryCalculations = (salaryConfig: SalaryConfig) => {
  console.log('🧪 Testing Salary Configuration:', salaryConfig);
  
  // Test quarterly amounts
  const totalQuarterly = salaryConfig.quarterlyAmounts.reduce((sum, q) => sum + q.amount, 0);
  const avgQuarterly = totalQuarterly / salaryConfig.quarterlyAmounts.length;
  console.log(`📊 Average quarterly amount: $${avgQuarterly.toLocaleString()}`);
  
  // Test payment frequency calculations
  let paymentAmount = 0;
  switch (salaryConfig.frequency) {
    case 'weekly':
      paymentAmount = avgQuarterly / 13;
      console.log(`💰 Weekly payment: $${paymentAmount.toLocaleString()}`);
      break;
    case 'biweekly':
      paymentAmount = avgQuarterly / 6.5;
      console.log(`💰 Biweekly payment: $${paymentAmount.toLocaleString()}`);
      break;
    case 'monthly':
      paymentAmount = avgQuarterly / 3;
      console.log(`💰 Monthly payment: $${paymentAmount.toLocaleString()}`);
      break;
    case 'yearly':
      paymentAmount = avgQuarterly * 4;
      console.log(`💰 Yearly payment: $${paymentAmount.toLocaleString()}`);
      break;
  }
  
  // Test payment days
  console.log(`📅 Payment days of month: ${salaryConfig.daysOfMonth.join(', ')}`);
  
  // Calculate next payment date
  const today = new Date();
  const nextPaymentDate = new Date(today);
  
  switch (salaryConfig.frequency) {
    case 'weekly':
      nextPaymentDate.setDate(today.getDate() + 7);
      break;
    case 'biweekly':
      nextPaymentDate.setDate(today.getDate() + 14);
      break;
    case 'monthly':
      nextPaymentDate.setMonth(today.getMonth() + 1);
      nextPaymentDate.setDate(salaryConfig.daysOfMonth[0] || 1);
      break;
    case 'yearly':
      nextPaymentDate.setFullYear(today.getFullYear() + 1);
      break;
  }
  
  console.log(`📅 Next payment date: ${nextPaymentDate.toLocaleDateString()}`);
  console.log('✅ Salary configuration test complete');
};
