
import React from 'react';
import { OnboardingStepProps } from './types';
import { OnboardingData } from './OnboardingFlow';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useCreateFinancialProfile,
  useCreateExpense,
  useCreateSavingsGoal
} from '@/hooks/useFinancialData';
import { useCreateSalary } from '@/hooks/useSalary';
import { formatCurrency } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { useFeatureTour } from '@/hooks/useFeatureTour';

interface Props {
  data: OnboardingData;
  onNext: () => void;
  onBack?: () => void;
}

const SummaryStep = ({ data, onNext }: OnboardingStepProps) => {
  const { user } = useAuth();
  const { startTour } = useFeatureTour();
  const createFinancialProfile = useCreateFinancialProfile();
  const createSalary = useCreateSalary();
  const createExpense = useCreateExpense();
  const createSavingsGoal = useCreateSavingsGoal();

  const handleComplete = async (startTourAfter = false) => {
    if (!user) {
      toast.error('You must be logged in to complete onboarding');
      return;
    }

    try {
      console.log('🎯 Starting onboarding completion with data:', data);

      // 1. Create financial profile first
      if (data.currency) {
        console.log('💰 Creating financial profile with currency:', data.currency);
        await createFinancialProfile.mutateAsync({
          base_currency: data.currency,
          start_date: new Date().toISOString().split('T')[0],
        });
      }

      // 2. Create salary if provided
      if (data.salary) {
        console.log('💰 Creating salary:', data.salary);
        // Convert old salary format to new format
        const schedule = data.salary.frequency === 'quarterly' ? 'monthly' : data.salary.frequency;
        const payDates = data.salary.daysOfMonth || [1];
        const paychecks = data.salary.quarterlyAmounts ? 
          Object.values(data.salary.quarterlyAmounts as Record<string, number>) : [0];
        
        await createSalary.mutateAsync({
          schedule: schedule as 'monthly' | 'biweekly' | 'yearly',
          pay_dates: payDates,
          paychecks: paychecks,
        });
      }

      // 3. Create expenses if provided
      if (data.expenses && data.expenses.length > 0) {
        console.log('💸 Creating expenses:', data.expenses);
        for (const expense of data.expenses) {
          await createExpense.mutateAsync({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            is_recurring: true,
            recurring_type: 'monthly',
            recurring_interval: 1,
            day_of_month: expense.dayOfMonth || null,
            is_reserved: true, // Mark onboarding expenses as reserved
          });
        }
      }

      // 4. Create savings goal if provided
      if (data.goal) {
        console.log('🎯 Creating savings goal:', data.goal);
        await createSavingsGoal.mutateAsync({
          name: data.goal.name,
          target_amount: data.goal.targetAmount,
          current_amount: 0,
          recurring_contribution: data.goal.recurringContribution || 0,
          contribution_frequency: data.goal.contributionFrequency || null,
          icon: data.goal.icon || '💰',
        });
      }

      console.log('✅ Onboarding completed successfully');
      toast.success('Welcome to SafeSpender! Your account has been set up.');
      
      // Complete onboarding first
      onNext();
      
      // Start tour if requested
      if (startTourAfter) {
        setTimeout(() => {
          startTour();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  const isLoading = 
    createFinancialProfile.isPending || 
    createSalary.isPending || 
    createExpense.isPending || 
    createSavingsGoal.isPending;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Summary</h2>
      <p>Review your information before proceeding.</p>

      {data.currency && (
        <div className="border rounded-md p-4">
          <strong>Base Currency:</strong> {data.currency}
        </div>
      )}

      {data.salary && (
        <div className="border rounded-md p-4">
          <strong>Salary Frequency:</strong> {data.salary.frequency}
          <br />
          <strong>Pay Days:</strong> {data.salary.daysOfMonth.join(', ')}
          <br />
          <strong>Quarterly Amounts:</strong>
          <ul>
            {data.salary.quarterlyAmounts.map((q, index) => (
              <li key={index}>
                {q.quarter}: {formatCurrency(q.amount, data.currency || 'USD')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.expenses && data.expenses.length > 0 && (
        <div className="border rounded-md p-4">
          <strong>Expenses:</strong>
          <ul>
            {data.expenses.map((expense, index) => (
              <li key={index}>
                {expense.description} - {formatCurrency(expense.amount, data.currency || 'USD')} ({expense.category})
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.goal && (
        <div className="border rounded-md p-4">
          <strong>Goal:</strong> {data.goal.name}
          <br />
          <strong>Target Amount:</strong> {formatCurrency(data.goal.targetAmount, data.currency || 'USD')}
          <br />
          <strong>Recurring Contribution:</strong> {formatCurrency(data.goal.recurringContribution || 0, data.currency || 'USD')} ({data.goal.contributionFrequency || 'none'})
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={() => handleComplete(false)} 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Setting up...' : 'Confirm & Skip Tour'}
        </Button>
        <Button 
          onClick={() => handleComplete(true)} 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Setting up...' : 'Confirm & Start Tour'}
        </Button>
      </div>
    </div>
  );
};

export default SummaryStep;
