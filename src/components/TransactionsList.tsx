
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isReserved?: boolean;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionsList = ({ transactions, onDeleteTransaction }: TransactionsListProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">No transactions yet</p>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
          Add your first income or expense to get started
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                transaction.type === 'income' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {transaction.description}
                  {transaction.isReserved && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                      Reserved
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {transaction.category && `${transaction.category} • `}
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                transaction.type === 'income' ? 'text-primary' : 'text-neutral-700 dark:text-neutral-300'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteTransaction(transaction.id)}
                className="w-6 h-6 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TransactionsList;
