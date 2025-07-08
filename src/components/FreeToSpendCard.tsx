
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, Clock, DollarSign, Globe } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import CurrencyDisplay from './CurrencyDisplay';
import EmergencyBorrowModal from './EmergencyBorrowModal';

interface FreeToSpendCardProps {
  amount: number;
  balance: number;
  reservedExpenses: number;
  assignedSavings: number;
}

const FreeToSpendCard = ({ amount, balance, reservedExpenses, assignedSavings }: FreeToSpendCardProps) => {
  const { getPendingExpenses, transactions, currency, convertCurrency } = useFinancial();
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState(currency);

  const pendingExpenses = getPendingExpenses();
  const totalBorrowed = transactions
    .filter(t => t.type === 'borrow')
    .reduce((sum, t) => sum + t.amount, 0);
  const isLow = amount < 100;
  const isVeryLow = amount < 50;

  const currencies = ['USD', 'EUR', 'CRC', 'GBP', 'CAD'];
  const symbols = { USD: '$', EUR: '€', CRC: '₡', GBP: '£', CAD: 'C$' };

  const convertAmount = (value: number) =>
    displayCurrency === currency ? value : convertCurrency(value, displayCurrency);

  const formatCurrency = (value: number) => {
    const converted = convertAmount(value);
    const symbol = symbols[displayCurrency as keyof typeof symbols] || '$';
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <>
      <Card className="p-8 income-gradient text-white shadow-lg hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* Currency selector (responsive) */}
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-medium text-white/90">Free to Spend Today</h2>
              <div className="sm:block hidden">
                <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                  <SelectTrigger className="w-20 h-8 bg-white/10 text-white border-white/20 text-xs ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop currency selector - inline next to amount title */}
            <div className="flex sm:hidden items-center gap-3 mb-2">
              <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                <SelectTrigger className="w-20 h-8 bg-white/10 text-white border-white/20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-4xl mb-1 text-white font-bold">
              {formatCurrency(amount)}
            </div>
            {isVeryLow && (
              <div className="flex items-center gap-2 text-orange-200">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Running low</span>
              </div>
            )}
          </div>
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-3 text-sm text-white/80">
          <div className="flex justify-between">
            <span>Current Balance</span>
            <span className="font-medium">{formatCurrency(balance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Reserved for Bills</span>
            <span className="font-medium">-{formatCurrency(reservedExpenses)}</span>
          </div>
          <div className="flex justify-between">
            <span>Assigned Savings</span>
            <span className="font-medium">-{formatCurrency(assignedSavings)}</span>
          </div>

          {pendingExpenses > 0 && (
            <div className="flex justify-between text-orange-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Expenses
              </span>
              <span className="font-medium">{formatCurrency(pendingExpenses)}</span>
            </div>
          )}

          {totalBorrowed > 0 && (
            <div className="flex justify-between text-blue-200">
              <span>Previously Borrowed</span>
              <span className="font-medium">+{formatCurrency(totalBorrowed)}</span>
            </div>
          )}

          <div className="border-t border-white/20 pt-3 flex justify-between font-semibold text-white">
            <span>Available to Spend</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="secondary"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => setShowBorrowModal(true)}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            I need more money
          </Button>
        </div>
      </Card>

      <EmergencyBorrowModal
        open={showBorrowModal}
        onOpenChange={setShowBorrowModal}
      />
    </>
  );
};

export default FreeToSpendCard;
