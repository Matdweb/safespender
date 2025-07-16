import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DashboardModals from '@/components/dashboard/DashboardModals';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useCreateTransaction } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';

interface CalendarAddItemButtonProps {
  selectedDate: Date | null;
  onItemAdded?: () => void;
}

const CalendarAddItemButton = ({ selectedDate, onItemAdded }: CalendarAddItemButtonProps) => {
  const { toast } = useToast();
  const createTransactionMutation = useCreateTransaction();
  
  // Modal states
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  
  // Action menu state
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Reuse dashboard handlers but customize for calendar context
  const { handleAddExpense } = useDashboardHandlers();

  const handleAddIncome = async (income: any) => {
    try {
      const targetDate = selectedDate || new Date();
      const dateStr = targetDate.toISOString().split('T')[0];
      
      await createTransactionMutation.mutateAsync({
        type: 'income',
        amount: income.amount,
        description: income.description,
        date: dateStr
      });
      
      toast({
        title: "Income Added!",
        description: `$${income.amount.toLocaleString()} added for ${targetDate.toLocaleDateString()}`,
      });
      
      onItemAdded?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive"
      });
    }
  };

  const handleAddSavings = async (savings: { goalId: string; amount: number; description: string }) => {
    try {
      const targetDate = selectedDate || new Date();
      const dateStr = targetDate.toISOString().split('T')[0];
      
      await createTransactionMutation.mutateAsync({
        type: 'savings',
        amount: savings.amount,
        description: savings.description,
        date: dateStr,
        goal_id: savings.goalId,
      });
      
      toast({
        title: "Savings Added!",
        description: `$${savings.amount.toLocaleString()} added for ${targetDate.toLocaleDateString()}`,
      });
      
      onItemAdded?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings",
        variant: "destructive"
      });
    }
  };

  const openIncomeDialog = () => {
    setShowActionMenu(false);
    setShowIncomeDialog(true);
  };

  const openExpenseDialog = () => {
    setShowActionMenu(false);
    setShowExpenseDialog(true);
  };

  const openSavingsDialog = () => {
    setShowActionMenu(false);
    setShowSavingsDialog(true);
  };

  return (
    <>
      {/* Quick action buttons */}
      {!showActionMenu ? (
        <Button
          onClick={() => setShowActionMenu(true)}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={openIncomeDialog}
            variant="outline"
            size="sm"
            className="text-primary border-primary/20 hover:bg-primary/10"
          >
            💰 Add Income
          </Button>
          <Button
            onClick={openExpenseDialog}
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
          >
            💳 Add Expense
          </Button>
          <Button
            onClick={openSavingsDialog}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600/20 hover:bg-blue-600/10"
          >
            🎯 Add Savings
          </Button>
          <Button
            onClick={() => setShowActionMenu(false)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Reuse Dashboard Modals */}
      <DashboardModals
        showIncomeDialog={showIncomeDialog}
        setShowIncomeDialog={setShowIncomeDialog}
        showExpenseDialog={showExpenseDialog}
        setShowExpenseDialog={setShowExpenseDialog}
        showSavingsDialog={showSavingsDialog}
        setShowSavingsDialog={setShowSavingsDialog}
        showSalaryModal={showSalaryModal}
        setShowSalaryModal={setShowSalaryModal}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
      />
    </>
  );
};

export default CalendarAddItemButton;