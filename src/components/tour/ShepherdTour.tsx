import React, { useEffect } from 'react';
import { useShepherdTour } from '@/hooks/useShepherdTour';

const ShepherdTour = () => {
  const { hasSeenTour } = useShepherdTour();

  useEffect(() => {
    // Check if tour should start after onboarding
    const shouldStartTour = localStorage.getItem('safespender-start-tour-after-onboarding');
    if (shouldStartTour === 'true' && !hasSeenTour) {
      localStorage.removeItem('safespender-start-tour-after-onboarding');
      // Import dynamically and start tour
      import('@/hooks/useShepherdTour').then(({ useShepherdTour }) => {
        // This will be handled by the tour starter component
      });
    }
  }, [hasSeenTour]);

  return null;
};

export default ShepherdTour;