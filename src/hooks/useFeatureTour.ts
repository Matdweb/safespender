
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFinancialProfile, useUpdateFinancialProfile } from '@/hooks/useFinancialData';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  page?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOverlay?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'free-to-spend',
    title: 'Your Free to Spend Amount',
    content: 'This is the amount of money you can safely spend today. It\'s calculated by taking your income, subtracting programmed expenses, savings, and bills. It updates automatically every day.',
    target: '[data-tour="free-to-spend"]',
    page: '/',
    position: 'bottom',
    showOverlay: true
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    content: 'These are your most common financial actions — like logging a new income, expense, or contribution to a savings goal. Tap one to get started.',
    target: '[data-tour="quick-actions"]',
    page: '/',
    position: 'bottom'
  },
  {
    id: 'borrow-feature',
    title: 'Need More Money?',
    content: 'If you\'re short on cash, you can pull from your next paycheck or savings. But remember — this affects your goals and future availability. Use wisely!',
    target: '[data-tour="borrow-button"]',
    page: '/',
    position: 'top'
  },
  {
    id: 'upcoming-events',
    title: 'Upcoming Events',
    content: 'These are expenses, incomes, and goals coming in the next 2 months. Always know what\'s ahead so there are no surprises.',
    target: '[data-tour="upcoming-events"]',
    page: '/',
    position: 'left'
  },
  {
    id: 'calendar-nav',
    title: 'Your Financial Calendar',
    content: 'This calendar shows your entire financial life — upcoming expenses, incomes, and savings — all in one place. Click to explore your financial timeline.',
    target: '[data-tour="calendar-nav"]',
    page: '/',
    position: 'bottom'
  },
  {
    id: 'goals-nav',
    title: 'Savings Goals',
    content: 'Set smart goals and SafeSpender will calculate how to reach them — or let you know if you fall behind. Track your progress here.',
    target: '[data-tour="goals-nav"]',
    page: '/',
    position: 'bottom'
  }
];

export const useFeatureTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: financialProfile } = useFinancialProfile();
  const updateFinancialProfile = useUpdateFinancialProfile();
  
  // Get hasSeenTour from Supabase profile
  const hasSeenTour = financialProfile?.has_completed_feature_tour || false;

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    // Navigate to home page if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextStep = tourSteps[nextStepIndex];
      
      // Navigate to the required page if different
      if (nextStep.page && location.pathname !== nextStep.page) {
        navigate(nextStep.page);
      }
      
      setCurrentStep(nextStepIndex);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      const prevStep = tourSteps[prevStepIndex];
      
      // Navigate to the required page if different
      if (prevStep.page && location.pathname !== prevStep.page) {
        navigate(prevStep.page);
      }
      
      setCurrentStep(prevStepIndex);
    }
  };

  const skipTour = async () => {
    setIsActive(false);
    setCurrentStep(0);
    
    // Update profile in Supabase
    try {
      await updateFinancialProfile.mutateAsync({
        has_completed_feature_tour: true
      });
    } catch (error) {
      console.error('Error updating tour completion status:', error);
    }
  };

  const completeTour = async () => {
    setIsActive(false);
    setCurrentStep(0);
    
    // Update profile in Supabase
    try {
      await updateFinancialProfile.mutateAsync({
        has_completed_feature_tour: true
      });
    } catch (error) {
      console.error('Error updating tour completion status:', error);
    }
  };

  const resetTour = async () => {
    // Reset tour completion status in Supabase
    try {
      await updateFinancialProfile.mutateAsync({
        has_completed_feature_tour: false
      });
    } catch (error) {
      console.error('Error resetting tour completion status:', error);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return {
    isActive,
    currentStep,
    currentTourStep,
    totalSteps: tourSteps.length,
    hasSeenTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour
  };
};
