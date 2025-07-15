import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import EnhancedBorrowModal from './EnhancedBorrowModal';
import { useAccurateFreeToSpend } from '@/hooks/useAccurateFreeToSpend';

interface FreeToSpendCardProps {
  // Legacy props for compatibility - will use accurate calculations internally
  amount?: number;
  balance?: number;
  reservedExpenses?: number;
  assignedSavings?: number;
}

const FreeToSpendCard = ({ amount, balance, reservedExpenses, assignedSavings }: FreeToSpendCardProps) => {
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  
  // Use accurate free to spend calculations
  const {
    totalIncome,
    reservedForBills,
    assignedToSavings: accurateAssignedSavings,
    freeToSpend,
    currentBalance,
    lastSalaryDate,
    isLoading
  } = useAccurateFreeToSpend();

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.85 },
    { code: 'CRC', symbol: '₡', rate: 525 },
    { code: 'GBP', symbol: '£', rate: 0.73 },
    { code: 'CAD', symbol: 'C$', rate: 1.25 }
  ];

  const selectedCurrency = currencies.find(c => c.code === displayCurrency) || currencies[0];

  const convertAmount = (value: number): number => {
    return value * selectedCurrency.rate;
  };

  const formatAmount = (value: number): string => {
    return `${selectedCurrency.symbol}${convertAmount(value).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 card-border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 card-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-finance-primary" />
            <h3 className="font-semibold">Free to Spend Today</h3>
          </div>
          
          {/* Currency Selector - Desktop */}
          <div className="hidden md:block">
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Amount */}
        <div className="text-center">
          <div className="text-4xl font-bold text-finance-primary mb-2 transition-all duration-300">
            {formatAmount(freeToSpend)}
          </div>
          <p className="text-sm text-subtle">
            {freeToSpend <= 0 && "You're over budget! "}
            {freeToSpend > 0 && freeToSpend < 100 && "Running low on funds "}
            {freeToSpend >= 100 && "Available to spend safely"}
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-3">💰 Financial Breakdown</h4>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm">Income Received</span>
            </div>
            <span className="font-medium text-green-600">{formatAmount(totalIncome)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm">Reserved for Bills</span>
            </div>
            <span className="font-medium text-red-600">-{formatAmount(reservedForBills)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Assigned to Savings</span>
            </div>
            <span className="font-medium text-blue-600">-{formatAmount(accurateAssignedSavings)}</span>
          </div>

          <hr className="border-border" />
          
          <div className="flex justify-between items-center font-semibold">
            <span className="text-sm">Free to Spend</span>
            <span className={`${freeToSpend >= 0 ? 'text-finance-primary' : 'text-red-600'}`}>
              {formatAmount(freeToSpend)}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-subtle">
          {lastSalaryDate && (
            <p>Last income: {lastSalaryDate.toLocaleDateString()}</p>
          )}
          <p>Current balance: {formatAmount(currentBalance)}</p>
        </div>

        {/* Currency Selector - Mobile */}
        <div className="md:hidden">
          <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Button */}
        {freeToSpend <= 50 && (
          <Button 
            onClick={() => setShowBorrowModal(true)} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            I Need More Money
          </Button>
        )}
      </div>

      <EnhancedBorrowModal 
        open={showBorrowModal}
        onOpenChange={setShowBorrowModal}
      />
    </Card>
  );
};

export default FreeToSpendCard;