
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, DollarSign, TrendingDown, ArrowUpCircle, PiggyBank } from 'lucide-react';
import { useDeleteTransaction } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/currencyUtils';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number | string;
  description: string;
  date: string;
  category?: string;
  created_at?: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
}

const TransactionsList = ({ transactions }: TransactionsListProps) => {
  const { currency } = useFinancial();
  const deleteTransactionMutation = useDeleteTransaction();
  const { toast } = useToast();

  // Sort transactions by date (most recent first)
  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [transactions]);

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="w-4 h-4" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-primary/10 text-primary';
      case 'expense':
        return 'bg-destructive/10 text-destructive';
      case 'savings':
        return 'bg-blue-600/10 text-blue-600';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-primary';
      case 'expense':
        return 'text-destructive';
      case 'savings':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

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
                  <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${getAmountColor(transaction.type)}`}>
                    {transaction.type === 'expense' || transaction.type === 'savings' ? '-' : '+'}
                    {formatCurrency(parseFloat(transaction.amount.toString()), currency)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteTransactionMutation.isPending}
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
