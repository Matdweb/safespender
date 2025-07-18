
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarItem } from '@/types/calendar';
import { format } from 'date-fns';
import { Trash2, Plus, DollarSign, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteExpense } from '@/hooks/useFinancialData';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import UnifiedTransactionModal from '@/components/modals/UnifiedTransactionModal';
import { useTransactionModal } from '@/hooks/useTransactionModal';

interface ViewDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  items: CalendarItem[];
  onDeleteItem: (id: string) => void;
}

const ViewDayModal = ({ open, onOpenChange, selectedDate, items, onDeleteItem }: ViewDayModalProps) => {
  const { toast } = useToast();
  const { mutate: deleteExpense } = useDeleteExpense();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const {
    isIncomeModalOpen,
    isExpenseModalOpen,
    isSavingsModalOpen,
    modalDate,
    modalTitle,
    openIncomeModal,
    openExpenseModal,
    openSavingsModal,
    closeAllModals,
  } = useTransactionModal();

  const handleDeleteItem = async (id: string, title: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(id);
      
      // Check if this is a generated salary or savings transaction
      if (id.startsWith('salary-') || id.startsWith('savings-')) {
        toast({
          title: "Cannot Delete",
          description: "Generated transactions cannot be deleted directly. Modify your salary or savings settings instead.",
          variant: "destructive"
        });
        return;
      }

      // Check if this is a recurring expense (generated from expenses table)
      if (id.startsWith('recurring-')) {
        // Extract the original expense ID from the RPC result format
        const parts = id.split('-');
        if (parts.length >= 2) {
          const expenseId = parts[1]; // recurring-{expense_id}-{date}
          await deleteExpense(expenseId);
          toast({
            title: "Recurring Expense Deleted",
            description: `"${title}" and all its future occurrences have been removed`,
          });
        }
      } else {
        // This is a regular transaction (one-time income/expense)
        await deleteExpense(id);
        
        // Only update free-to-spend if the expense date is today or in the past
        const selectedDateStr = selectedDate?.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        
        if (selectedDateStr && selectedDateStr <= today) {
          toast({
            title: "Item Deleted",
            description: `"${title}" has been removed and your balance updated`,
          });
        } else {
          toast({
            title: "Future Item Deleted",
            description: `"${title}" has been removed (no impact on current balance)`,
          });
        }
      }
      
      // Call the parent's onDeleteItem to update the UI
      onDeleteItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="w-4 h-4 text-primary" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-primary';
      case 'expense':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No financial items for this date</p>
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.type === 'income'
                        ? 'default'
                        : item.type === 'expense'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {item.type}
                  </Badge>
                  <span className="font-medium">{item.title}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      item.type === 'income'
                        ? 'text-primary'
                        : item.type === 'expense'
                        ? 'text-destructive'
                        : 'text-foreground'
                    )}
                  >
                    {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                  </span>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id, item.title)}
                disabled={isDeleting === item.id}
                className="ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => openIncomeModal(selectedDate || undefined)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
          <Button
            onClick={() => openExpenseModal(selectedDate || undefined)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
          <Button
            onClick={() => openSavingsModal(selectedDate || undefined)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Savings
          </Button>
        </div>
      </DialogContent>

      {/* Unified Transaction Modals */}
      <UnifiedTransactionModal
        open={isIncomeModalOpen}
        onOpenChange={(open) => !open && closeAllModals()}
        type="income"
        defaultDate={modalDate}
        title={modalTitle}
      />
      <UnifiedTransactionModal
        open={isExpenseModalOpen}
        onOpenChange={(open) => !open && closeAllModals()}
        type="expense"
        defaultDate={modalDate}
        title={modalTitle}
      />
      <UnifiedTransactionModal
        open={isSavingsModalOpen}
        onOpenChange={(open) => !open && closeAllModals()}
        type="savings"
        defaultDate={modalDate}
        title={modalTitle}
      />
    </Dialog>
  );
};

export default ViewDayModal;
