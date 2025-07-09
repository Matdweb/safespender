
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { TourStep } from '@/hooks/useFeatureTour';

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

const TourTooltip = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isVisible
}: TourTooltipProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isVisible || !step.target) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target) as HTMLElement;
      if (!element) return;

      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = rect.top + scrollTop - 120;
          left = rect.left + scrollLeft + rect.width / 2 - 150;
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + rect.width / 2 - 150;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2 - 60;
          left = rect.left + scrollLeft - 320;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2 - 60;
          left = rect.right + scrollLeft + 10;
          break;
        default:
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + rect.width / 2 - 150;
      }

      // Ensure tooltip stays within viewport
      const tooltipWidth = 300;
      const tooltipHeight = 120;
      
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipHeight > window.innerHeight + scrollTop - 10) {
        top = rect.top + scrollTop - tooltipHeight - 10;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step, isVisible]);

  useEffect(() => {
    if (targetElement && isVisible) {
      // Highlight the target element
      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '1000';
      targetElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)';
      targetElement.style.borderRadius = '8px';
      targetElement.style.transition = 'all 0.3s ease';

      // Scroll element into view if needed
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return () => {
        // Clean up highlighting
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
        targetElement.style.transition = '';
      };
    }
  }, [targetElement, isVisible]);

  if (!isVisible) return null;

  const isWarningStep = step.id === 'borrow-feature';

  return (
    <>
      {/* Overlay */}
      {step.showOverlay && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 animate-fade-in" />
      )}
      
      {/* Tooltip */}
      <Card 
        className="fixed z-50 w-80 p-4 shadow-lg border-2 border-primary/20 animate-scale-in"
        style={{ 
          top: position.top, 
          left: position.left,
          maxWidth: 'calc(100vw - 20px)'
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isWarningStep && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            <h3 className="font-semibold text-sm">{step.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {step.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                className="h-8 px-3"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={onNext}
              className="h-8 px-3"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </Card>
    </>
  );
};

export default TourTooltip;
