import { useEffect } from 'react';
import { useShepherdTour } from '@/hooks/useShepherdTour';

const ShepherdTourStarter = () => {
  const { startTour, hasSeenTour } = useShepherdTour();

  useEffect(() => {
    const shouldStartTour = localStorage.getItem('safespender-start-tour-after-onboarding');
    if (shouldStartTour === 'true' && !hasSeenTour) {
      localStorage.removeItem('safespender-start-tour-after-onboarding');
      // Start tour after a brief delay to ensure page is loaded
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [startTour, hasSeenTour]);

  return null;
};

export default ShepherdTourStarter;