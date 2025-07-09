import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  is_recurring: boolean;
  user_id: string;
}

export const useRecurringExpenses = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['recurring-expenses', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('generate_recurring_expenses', {
        user_id_param: user.user.id,
        start_date_param: startDate.toISOString().split('T')[0],
        end_date_param: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      return data as RecurringExpense[];
    },
    enabled: !!(startDate && endDate),
  });
};

export const generateRecurringExpenses = async (userId: string, startDate: Date, endDate: Date) => {
  const { data, error } = await supabase.rpc('generate_recurring_expenses', {
    user_id_param: userId,
    start_date_param: startDate.toISOString().split('T')[0],
    end_date_param: endDate.toISOString().split('T')[0]
  });

  if (error) throw error;
  return data as RecurringExpense[];
};