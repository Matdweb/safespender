
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { generateRecurringExpenses, RecurringExpense } from '@/hooks/useRecurringExpenses';

export type FinancialProfile = Tables<'financial_profiles'>;

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

// Salary Operations
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

export const deleteSavingsGoal = async (id: string) => {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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

// Recurring Expenses Operations
export const getRecurringExpenses = async (startDate: Date, endDate: Date) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  return await generateRecurringExpenses(user.user.id, startDate, endDate);
};

export { generateRecurringExpenses, type RecurringExpense };
