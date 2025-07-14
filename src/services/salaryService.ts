import { supabase } from '@/integrations/supabase/client';

export interface SalaryData {
  id: string;
  user_id: string;
  schedule: 'monthly' | 'biweekly' | 'yearly';
  pay_dates: number[];
  paychecks: number[];
  time_created: string;
  time_updated: string;
}

export interface CreateSalaryData {
  schedule: 'monthly' | 'biweekly' | 'yearly';
  pay_dates: number[];
  paychecks: number[];
}

export interface UpdateSalaryData {
  schedule?: 'monthly' | 'biweekly' | 'yearly';
  pay_dates?: number[];
  paychecks?: number[];
}

// Get user's salary configuration
export const getSalary = async (): Promise<SalaryData | null> => {
  const { data, error } = await supabase
    .from('salary')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as SalaryData;
};

// Create new salary configuration
export const createSalary = async (salaryData: CreateSalaryData): Promise<SalaryData> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('salary')
    .insert({
      user_id: user.user.id,
      ...salaryData
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as SalaryData;
};

// Update salary configuration
export const updateSalary = async (salaryData: UpdateSalaryData): Promise<SalaryData> => {
  const { data, error } = await supabase
    .from('salary')
    .update(salaryData)
    .select()
    .single();
  
  if (error) throw error;
  return data as SalaryData;
};

// Delete salary configuration
export const deleteSalary = async (): Promise<void> => {
  const { error } = await supabase
    .from('salary')
    .delete()
    .single();
  
  if (error) throw error;
};

// Generate salary transactions for calendar display
export const generateSalaryTransactions = (
  salary: SalaryData,
  startDate: Date,
  endDate: Date
) => {
  const transactions: Array<{
    id: string;
    type: 'income';
    amount: number;
    description: string;
    date: string;
    category: string;
  }> = [];

  // Helper function to adjust date for February
  const adjustDateForMonth = (date: number, month: number, year: number): number => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return date > daysInMonth ? daysInMonth : date;
  };

  // Generate transactions based on schedule
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();
    
    // Process each pay date for this month
    salary.pay_dates.forEach((payDate, index) => {
      const adjustedDate = adjustDateForMonth(payDate, currentMonth, currentYear);
      const transactionDate = new Date(currentYear, currentMonth, adjustedDate);
      
      // Only add if within our date range
      if (transactionDate >= startDate && transactionDate <= endDate) {
        const paycheck = salary.paychecks[index] || 0;
        
        if (paycheck > 0) {
          transactions.push({
            id: `salary-${salary.id}-${transactionDate.getTime()}`,
            type: 'income',
            amount: paycheck,
            description: 'Salary Payment',
            date: transactionDate.toISOString().split('T')[0],
            category: 'salary'
          });
        }
      }
    });
    
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }
  
  return transactions;
};