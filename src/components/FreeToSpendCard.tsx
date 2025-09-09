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
    <Card className="relative overflow-hidden animate-fade-in">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Animated Border Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 opacity-30 animate-pulse rounded-lg" 
           style={{ padding: '1px' }}>
        <div className="w-full h-full bg-background rounded-lg" />
      </div>

      <div className="relative p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <Wallet className="relative w-6 h-6 text-primary animate-scale-in" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Free to Spend</h3>
              <p className="text-xs text-muted-foreground">Real-time calculation</p>
            </div>
          </div>
          
          {/* Enhanced Currency Selector - Desktop */}
          <div className="hidden md:block">
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-24 h-9 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code} className="hover:bg-primary/10">
                    {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Enhanced Main Amount with Glow Effect */}
        <div className="py-4 flex flex-col items-center text-center">
  <div className="relative">
    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110" />
    <div
      className={`relative text-4xl sm:text-5xl font-black tracking-tight mb-3 transition-all duration-500 ${
        freeToSpend >= 0 ? 'text-primary' : 'text-destructive'
      }`}
    >
      {formatAmount(freeToSpend)}
    </div>
  </div>

  <div
    className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      freeToSpend <= 0
        ? 'bg-destructive/10 text-destructive'
        : freeToSpend < 100
        ? 'bg-orange-500/10 text-orange-600'
        : 'bg-primary/10 text-primary'
    }`}
  >
    {freeToSpend <= 0 && <AlertTriangle className="w-4 h-4" />}
    {freeToSpend <= 0 && "You're over budget!"}
    {freeToSpend > 0 && freeToSpend < 100 && "Running low on funds"}
    {freeToSpend >= 100 && "✨ Available to spend safely"}
  </div>
</div>

        {/* Enhanced Breakdown with Better Visual Hierarchy */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-xl" />
          <div className="relative bg-muted/40 backdrop-blur-sm rounded-xl p-5 space-y-4 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">💰</span>
              </div>
              <h4 className="font-semibold text-base">Financial Breakdown</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10 hover-scale">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">Income Received</span>
                </div>
                <span className="font-bold text-green-600 text-lg">{formatAmount(totalIncome)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover-scale">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-medium">Reserved for Bills</span>
                </div>
                <span className="font-bold text-red-600 text-lg">-{formatAmount(reservedForBills)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 hover-scale">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Assigned to Savings</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">-{formatAmount(accurateAssignedSavings)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Additional Info */}
        <div className="flex items-center justify-between text-xs bg-muted/20 rounded-lg p-3 border border-border/30">
          <div className="space-y-1">
            {lastSalaryDate && (
              <p className="text-muted-foreground">
                <span className="font-medium">Last income:</span> {lastSalaryDate.toLocaleDateString()}
              </p>
            )}
            <p className="text-muted-foreground" data-tour="current-balance">
              <span className="font-medium">Current balance:</span> {formatAmount(currentBalance)}
            </p>
          </div>
        </div>

        {/* Enhanced Currency Selector - Mobile */}
        <div className="md:hidden">
          <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
            <SelectTrigger className="w-full border-primary/20 hover:border-primary/40 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code} className="hover:bg-primary/10">
                  {curr.symbol} {curr.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Action Button */}
        {freeToSpend <= 50 && (
          <Button 
            onClick={() => setShowBorrowModal(true)} 
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
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