
import React from 'react';
import { useFeatureTour } from '@/hooks/useFeatureTour';
import TourTooltip from './TourTooltip';

const FeatureTour = () => {
  const {
    isActive,
    currentStep,
    currentTourStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour
  } = useFeatureTour();

  if (!isActive || !currentTourStep) return null;

  return (
    <TourTooltip
      step={currentTourStep}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      isVisible={isActive}
    />
  );
};

export default FeatureTour;
