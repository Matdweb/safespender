import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  type SalaryData,
  type CreateSalaryData,
  type UpdateSalaryData
} from '@/services/salaryService';

// Hook to get salary data
export const useSalary = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['salary', user?.id],
    queryFn: getSalary,
    enabled: !!user,
  });
};

// Hook to create salary
export const useCreateSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
};

// Hook to update salary
export const useUpdateSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
};

// Hook to delete salary
export const useDeleteSalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSalary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
};