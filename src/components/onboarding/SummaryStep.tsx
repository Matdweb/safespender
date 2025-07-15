
import React from 'react';
import { OnboardingStepProps } from './types';
import { OnboardingData } from './OnboardingFlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateFinancialProfile, useUpdateFinancialProfile } from '@/hooks/useFinancialData';
import { useSalary } from '@/hooks/useSalary';
import { useExpenses, useSavingsGoals } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { useFeatureTour } from '@/hooks/useFeatureTour';
import { useNavigate } from 'react-router-dom';

interface Props {
  data: OnboardingData;
  onNext: () => void;
  onBack?: () => void;
}

const SummaryStep = ({ data, onNext }: OnboardingStepProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useFeatureTour();
  const createFinancialProfile = useCreateFinancialProfile();
  const updateFinancialProfile = useUpdateFinancialProfile();
  const { data: currentSalary } = useSalary();
  const { data: expenses } = useExpenses();
  const { data: goals } = useSavingsGoals();

  const handleComplete = async (startTourAfter = false) => {
    if (!user) {
      toast.error('You must be logged in to complete onboarding');
      return;
    }

    try {
      console.log('🎯 Completing onboarding setup...');

      // Only create/update financial profile with currency and tour completion status
      if (data.currency) {
        console.log('💰 Setting up financial profile with currency:', data.currency);
        try {
          await createFinancialProfile.mutateAsync({
            base_currency: data.currency,
            start_date: new Date().toISOString().split('T')[0],
            has_completed_feature_tour: false, // Will be updated when tour completes
          });
        } catch (error) {
          // Profile might already exist, try to update instead
          console.log('Profile exists, updating currency...');
          await updateFinancialProfile.mutateAsync({
            base_currency: data.currency,
            has_completed_feature_tour: false,
          });
        }
      }

      console.log('✅ Onboarding completed successfully');
      toast.success('Welcome to SafeSpender! Your account has been set up.');
      
      // Complete onboarding and navigate
      onNext();
      
      // Navigate to dashboard without page reload
      navigate('/', { replace: true });
      
      // Start tour if requested
      if (startTourAfter) {
        setTimeout(() => {
          startTour();
        }, 1000); // Give time for navigation to complete
      }
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  const isLoading = createFinancialProfile.isPending || updateFinancialProfile.isPending;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground">
          Here's a summary of your financial setup. Everything is ready to go!
        </p>
      </div>

      <div className="space-y-4">
        {data.currency && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="font-semibold">Base Currency</h3>
                <p className="text-muted-foreground">{data.currency}</p>
              </div>
            </div>
          </Card>
        )}

        {currentSalary && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💼</span>
              <div>
                <h3 className="font-semibold">Salary Configuration</h3>
                <p className="text-muted-foreground">
                  {currentSalary.schedule} schedule configured
                </p>
              </div>
            </div>
          </Card>
        )}

        {expenses && expenses.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💸</span>
              <div>
                <h3 className="font-semibold">Monthly Expenses</h3>
                <p className="text-muted-foreground">
                  {expenses.length} expense{expenses.length === 1 ? '' : 's'} configured
                </p>
              </div>
            </div>
          </Card>
        )}

        {goals && goals.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold">Savings Goals</h3>
                <p className="text-muted-foreground">
                  {goals.length} goal{goals.length === 1 ? '' : 's'} created
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 Take the feature tour to learn how to make the most of SafeSpender!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={() => handleComplete(false)} 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Setting up...' : 'Finish & Skip Tour'}
        </Button>
        <Button 
          onClick={() => handleComplete(true)} 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Setting up...' : 'Finish & Start Tour'}
        </Button>
      </div>
    </div>
  );
};

export default SummaryStep;
