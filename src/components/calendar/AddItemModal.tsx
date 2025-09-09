
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarItem } from '@/types/calendar';
import { Calendar as CalendarIcon, Plus, PiggyBank, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import DashboardModals from '../dashboard/DashboardModals';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onAddItem: (item: Omit<CalendarItem, 'id'>) => void;
}

const AddItemModal = ({ open, onOpenChange, selectedDate }: AddItemModalProps) => {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  
  const { handleAddIncome, handleAddExpense, handleAddSavings } = useDashboardHandlers();

  const onAddIncome = () => {
    setShowIncomeDialog(true);
  };
  const onAddExpense = () => {
    setShowExpenseDialog(true);
  };
  const onAddSavings = () => {
    setShowSavingsDialog(true);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg w-full max-w-72 px-4 py-6 sm:px-6 sm:py-8">
        <DialogHeader>
          <DialogTitle>
            📊 Add Financial Item
            {selectedDate && (
              <span className="block text-sm text-muted-foreground font-normal mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 hover-lift cursor-pointer bg-card" onClick={onAddIncome}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Income</h3>
            <p className="text-xs text-muted-foreground">Record earnings</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer bg-card" onClick={onAddExpense}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-destructive rotate-180" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Expense</h3>
            <p className="text-xs text-muted-foreground">Track spending</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover-lift cursor-pointer bg-card" onClick={onAddSavings}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Add Savings</h3>
            <p className="text-xs text-muted-foreground">Extra contribution</p>
          </div>
        </div>
      </Card>
      </div>
      </DialogContent>
      
    </Dialog>

    <DashboardModals
        showIncomeDialog={showIncomeDialog}
        setShowIncomeDialog={setShowIncomeDialog}
        showExpenseDialog={showExpenseDialog}
        setShowExpenseDialog={setShowExpenseDialog}
        showSavingsDialog={showSavingsDialog}
        setShowSavingsDialog={setShowSavingsDialog}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
      />
    </>
  );
};

export default AddItemModal;
