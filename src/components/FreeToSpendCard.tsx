
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface FreeToSpendCardProps {
  amount: number;
  balance: number;
  reservedExpenses: number;
  assignedSavings: number;
}

const FreeToSpendCard = ({ amount, balance, reservedExpenses, assignedSavings }: FreeToSpendCardProps) => {
  const isLow = amount < 100;
  const isVeryLow = amount < 50;

  return (
    <Card className="p-8 bg-gradient-to-br from-primary to-primary/90 text-white shadow-lg hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-white/90 mb-2">Free to Spend Today</h2>
          <div className="text-4xl font-bold mb-1">
            ${amount.toLocaleString()}
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
          <span className="font-medium">${balance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Reserved for Bills</span>
          <span className="font-medium">-${reservedExpenses.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Assigned Savings</span>
          <span className="font-medium">-${assignedSavings.toLocaleString()}</span>
        </div>
        <div className="border-t border-white/20 pt-3 flex justify-between font-semibold text-white">
          <span>Available to Spend</span>
          <span>${amount.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
};

export default FreeToSpendCard;
