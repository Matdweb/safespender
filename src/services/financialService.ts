
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
// Remove old import since useRecurringExpenses was deleted

export type FinancialProfile = Tables<'financial_profiles'>;
export type Salary = Tables<'salary'>;
export type Expense = Tables<'expenses'>;
export type SavingsGoal = Tables<'savings_goals'>;
export type Transaction = Tables<'transactions'>;

// Financial Profile Operations
export const createFinancialProfile = async (profile: TablesInsert<'financial_profiles'>) => {
  const { data, error } = await supabase
    .from('financial_profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getFinancialProfile = async () => {
  const { data, error } = await supabase
    .from('financial_profiles')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateFinancialProfile = async (updates: TablesUpdate<'financial_profiles'>) => {
  const { data, error } = await supabase
    .from('financial_profiles')
    .update(updates)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// New Salary Operations
export const createSalary = async (salary: TablesInsert<'salary'>) => {
  const { data, error } = await supabase
    .from('salary')
    .insert(salary)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSalary = async () => {
  const { data, error } = await supabase
    .from('salary')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateSalary = async (updates: TablesUpdate<'salary'>) => {
  const { data, error } = await supabase
    .from('salary')
    .update(updates)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Expenses Operations
export const createExpense = async (expense: TablesInsert<'expenses'>) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateExpense = async (id: string, updates: TablesUpdate<'expenses'>) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Savings Goals Operations
export const createSavingsGoal = async (goal: TablesInsert<'savings_goals'>) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .insert(goal)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSavingsGoals = async () => {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateSavingsGoal = async (id: string, updates: TablesUpdate<'savings_goals'>) => {
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get the goal to check current amount
  const { data: goal, error: fetchError } = await supabase
    .from('savings_goals')
    .select('current_amount, name')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!goal) throw new Error('Goal not found');

  const currentAmount = parseFloat(goal.current_amount.toString());

  // If there's money in the goal, transfer it back to free spend
  if (currentAmount > 0) {
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'income',
        amount: currentAmount,
        description: `Money recovered from deleted goal: ${goal.name}`,
        date: new Date().toISOString().split('T')[0],
        category: 'goal-deletion',
        user_id: user.id
      });

    if (transactionError) throw transactionError;
  }

  // Delete related transactions first (this removes the foreign key constraint)
  const { error: deleteTransactionsError } = await supabase
    .from('transactions')
    .delete()
    .eq('goal_id', goalId);

  if (deleteTransactionsError) throw deleteTransactionsError;

  // Now delete the goal
  const { error: deleteGoalError } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (deleteGoalError) throw deleteGoalError;
};

// Transactions Operations
export const createTransaction = async (transaction: TablesInsert<'transactions'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateTransaction = async (id: string, updates: TablesUpdate<'transactions'>) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Recurring Expenses Operations - Now handled by the unified expense system
export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  is_recurring: boolean;
  user_id: string;
}

export const getRecurringExpenses = async (startDate: Date, endDate: Date): Promise<RecurringExpense[]> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('generate_recurring_expenses', {
    user_id_param: user.user.id,
    start_date_param: startDate.toISOString().split('T')[0],
    end_date_param: endDate.toISOString().split('T')[0]
  });

  if (error) throw error;
  return data as RecurringExpense[];
};

// Delete salary operation
export const deleteSalary = async (id: string) => {
  const { error } = await supabase
    .from('salary')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
