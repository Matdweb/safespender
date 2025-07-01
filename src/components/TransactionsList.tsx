
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, DollarSign, TrendingDown } from 'lucide-react';
import { Transaction } from '@/contexts/FinancialContext';

interface TransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionsList = ({ transactions, onDeleteTransaction }: TransactionsListProps) => {
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card className="p-6 card-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        {transactions.length > 10 && (
          <span className="text-sm text-muted-foreground">
            Showing 10 of {transactions.length}
          </span>
        )}
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3 pr-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-subtle">No transactions yet</p>
              <p className="text-xs text-subtle mt-2">
                Add your first income or expense to get started!
              </p>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {transaction.type === 'income' ? (
                      <DollarSign className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {transaction.recurring && ' • Recurring'}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${
                    transaction.type === 'income' 
                      ? 'text-primary' 
                      : 'text-destructive'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    ${transaction.amount.toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TransactionsList;
