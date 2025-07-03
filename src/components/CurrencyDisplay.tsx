
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  hideToggle?: boolean;
}

const CurrencyDisplay = ({ amount, className = '', hideToggle = false }: CurrencyDisplayProps) => {
  const { currency, convertCurrency } = useFinancial();
  const [displayCurrency, setDisplayCurrency] = useState(currency);

  const currencies = ['USD', 'EUR', 'CRC', 'GBP', 'CAD'];
  const symbols = { USD: '$', EUR: '€', CRC: '₡', GBP: '£', CAD: 'C$' };

  const toggleCurrency = () => {
    const currentIndex = currencies.indexOf(displayCurrency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setDisplayCurrency(currencies[nextIndex]);
  };

  const displayAmount = displayCurrency === currency ? amount : convertCurrency(amount, displayCurrency);
  const symbol = symbols[displayCurrency as keyof typeof symbols] || '$';

  // Check if this is an inline display (for use within other text)
  const isInline = className.includes('inline');

  if (isInline || hideToggle) {
    return (
      <span className={className.replace('inline', '').trim()}>
        {symbol}{displayAmount.toLocaleString()}
        {displayCurrency !== currency && (
          <span className="text-xs opacity-70 ml-1">
            ({displayCurrency})
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold">
        {symbol}{displayAmount.toLocaleString()}
      </span>
      {displayCurrency !== currency && (
        <span className="text-xs text-muted-foreground">
          ({displayCurrency})
        </span>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={toggleCurrency} className="h-6 w-6 p-0">
              <Globe className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch currency display</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CurrencyDisplay;
