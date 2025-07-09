
import { useEffect } from 'react';
import { useFeatureTour } from '@/hooks/useFeatureTour';

const TourAutoStarter = () => {
  const { startTour, hasSeenTour } = useFeatureTour();

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

export default TourAutoStarter;
