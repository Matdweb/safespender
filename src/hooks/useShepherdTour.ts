import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateFinancialProfile, useFinancialProfile } from '@/hooks/useFinancialData';
import { toast } from 'sonner';

// Dynamically import Shepherd to avoid SSR issues
const loadShepherd = async () => {
  const Shepherd = (await import('shepherd.js')).default;
  return Shepherd;
};

export const useShepherdTour = () => {
  const tourRef = useRef<any>(null);
  const navigate = useNavigate();
  const updateFinancialProfile = useUpdateFinancialProfile();
  const { data: financialProfile } = useFinancialProfile();
  
  const hasSeenTour = financialProfile?.has_completed_feature_tour || false;

  const initializeTour = async () => {
    const Shepherd = await loadShepherd();
    
    if (tourRef.current) {
      tourRef.current.complete();
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    });

    // Step 1: Welcome Message
    tour.addStep({
      title: 'Welcome! 👋',
      text: "Welcome! Let's take a quick tour of your budget.",
      buttons: [
        {
          text: 'Skip',
          classes: 'shepherd-button-secondary',
          action: () => {
            tour.complete();
            completeTour();
          }
        },
        {
          text: 'Start Tour',
          classes: 'shepherd-button-primary',
          action: () => tour.next()
        }
      ],
      id: 'welcome'
    });

    // Step 2: Free to Spend
    tour.addStep({
      title: 'Your Free to Spend Amount',
      text: "This is your free-to-spend balance. It updates as you earn, save, and spend.",
      attachTo: {
        element: '[data-tour="free-to-spend"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => tour.back()
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: () => tour.next()
        }
      ],
      id: 'free-to-spend'
    });

    // Step 3: Current Balance
    tour.addStep({
      title: 'Current Balance',
      text: "Here's your current balance, combining all activity.",
      attachTo: {
        element: '[data-tour="current-balance"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => tour.back()
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: () => tour.next()
        }
      ],
      id: 'current-balance'
    });

    // Step 4: Goals Overview
    tour.addStep({
      title: 'Savings Goals',
      text: "This section shows how much you're saving each month toward your goals.",
      attachTo: {
        element: '[data-tour="goals-overview"]',
        on: 'top'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => tour.back()
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: () => tour.next()
        }
      ],
      id: 'goals-overview'
    });

    // Step 5: Calendar Section
    tour.addStep({
      title: 'Calendar & Planning',
      text: "Plan your expenses and view activity using the calendar.",
      attachTo: {
        element: '[data-tour="calendar-section"]',
        on: 'top'
      },
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: () => tour.back()
        },
        {
          text: 'Next',
          classes: 'shepherd-button-primary',
          action: () => tour.next()
        }
      ],
      id: 'calendar-section'
    });

    // Final Step: Tour Completed
    tour.addStep({
      title: 'Tour Completed! 🎉',
      text: "That's it! You're all set. You can retake the tour anytime from Settings.",
      buttons: [
        {
          text: 'Finish',
          classes: 'shepherd-button-primary',
          action: () => {
            tour.complete();
            completeTour();
          }
        }
      ],
      id: 'completed'
    });

    // Handle tour completion
    tour.on('complete', () => {
      completeTour();
    });

    // Handle tour cancellation
    tour.on('cancel', () => {
      completeTour();
    });

    // Save progress to localStorage
    tour.on('show', (event: any) => {
      localStorage.setItem('shepherd-tour-step', event.step.id);
    });

    tourRef.current = tour;
    return tour;
  };

  const startTour = async () => {
    // Navigate to dashboard if not already there
    navigate('/');
    
    // Wait for navigation and DOM updates
    setTimeout(async () => {
      const tour = await initializeTour();
      
      // Check if we should resume from a saved step
      const savedStep = localStorage.getItem('shepherd-tour-step');
      if (savedStep && savedStep !== 'completed') {
        try {
          tour.show(savedStep);
        } catch {
          // If step doesn't exist, start from beginning
          tour.start();
        }
      } else {
        tour.start();
      }
    }, 500);
  };

  const completeTour = async () => {
    try {
      await updateFinancialProfile.mutateAsync({
        has_completed_feature_tour: true
      });
      localStorage.removeItem('shepherd-tour-step');
      toast.success('Tour completed! You can restart it anytime from the Help button.');
    } catch (error) {
      console.error('Error updating tour completion status:', error);
      toast.error('Failed to save tour completion status.');
    }
  };

  const resetTour = async () => {
    try {
      await updateFinancialProfile.mutateAsync({
        has_completed_feature_tour: false
      });
      localStorage.removeItem('shepherd-tour-step');
      toast.success('Tour reset! You can start it again.');
    } catch (error) {
      console.error('Error resetting tour completion status:', error);
      toast.error('Failed to reset tour status.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tourRef.current) {
        tourRef.current.complete();
      }
    };
  }, []);

  return {
    startTour,
    resetTour,
    hasSeenTour,
    isActive: !!tourRef.current?.isActive()
  };
};