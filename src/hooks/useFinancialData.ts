
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFinancialProfile,
  createFinancialProfile,
  updateFinancialProfile,
  getSalaryConfiguration,
  createSalaryConfiguration,
  updateSalaryConfiguration,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type FinancialProfile,
  type SalaryConfiguration,
  type Expense,
  type SavingsGoal,
  type Transaction
} from '@/services/financialService';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Financial Profile Hooks
export const useFinancialProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['financial-profile', user?.id],
    queryFn: getFinancialProfile,
    enabled: !!user,
  });
};

export const useCreateFinancialProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (profile: Omit<TablesInsert<'financial_profiles'>, 'user_id'>) => 
      createFinancialProfile({ ...profile, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-profile'] });
    },
  });
};

export const useUpdateFinancialProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFinancialProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-profile'] });
    },
  });
};

// Salary Configuration Hooks
export const useSalaryConfiguration = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['salary-configuration', user?.id],
    queryFn: getSalaryConfiguration,
    enabled: !!user,
  });
};

export const useCreateSalaryConfiguration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (salary: Omit<TablesInsert<'salary_configurations'>, 'user_id'>) => 
      createSalaryConfiguration({ ...salary, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-configuration'] });
    },
  });
};

export const useUpdateSalaryConfiguration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSalaryConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-configuration'] });
    },
  });
};

// Expenses Hooks
export const useExpenses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: getExpenses,
    enabled: !!user,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (expense: Omit<TablesInsert<'expenses'>, 'user_id'>) => 
      createExpense({ ...expense, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'expenses'> }) => 
      updateExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

// Savings Goals Hooks
export const useSavingsGoals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: getSavingsGoals,
    enabled: !!user,
  });
};

export const useCreateSavingsGoal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (goal: Omit<TablesInsert<'savings_goals'>, 'user_id'>) => 
      createSavingsGoal({ ...goal, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
};

export const useUpdateSavingsGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'savings_goals'> }) => 
      updateSavingsGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
};

export const useDeleteSavingsGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
};

// Transactions Hooks
export const useTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: getTransactions,
    enabled: !!user,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (transaction: Omit<TablesInsert<'transactions'>, 'user_id'>) => 
      createTransaction({ ...transaction, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'transactions'> }) => 
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
