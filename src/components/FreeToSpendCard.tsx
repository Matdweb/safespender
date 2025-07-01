
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react';
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
  const { getPendingExpenses, borrowedAmounts } = useFinancial();
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const pendingExpenses = getPendingExpenses();
  const totalBorrowed = borrowedAmounts.reduce((sum, borrow) => sum + borrow.amount, 0);
  const isLow = amount < 100;
  const isVeryLow = amount < 50;

  return (
    <>
      <Card className="p-8 income-gradient text-white shadow-lg hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-white/90 mb-2">Free to Spend Today</h2>
            <CurrencyDisplay amount={amount} className="text-4xl mb-1" />
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
          
          {pendingExpenses > 0 && (
            <div className="flex justify-between text-orange-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Expenses
              </span>
              <span className="font-medium">${pendingExpenses.toLocaleString()}</span>
            </div>
          )}

          {totalBorrowed > 0 && (
            <div className="flex justify-between text-blue-200">
              <span>Previously Borrowed</span>
              <span className="font-medium">+${totalBorrowed.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t border-white/20 pt-3 flex justify-between font-semibold text-white">
            <span>Available to Spend</span>
            <span>${amount.toLocaleString()}</span>
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
