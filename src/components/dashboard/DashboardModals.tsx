import React from 'react';
import AddIncomeDialog from '@/components/AddIncomeDialog';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import AddSavingsDialog from '@/components/AddSavingsDialog';
import SetSalaryModal from '@/components/SetSalaryModal';

interface DashboardModalsProps {
  showIncomeDialog: boolean;
  setShowIncomeDialog: (show: boolean) => void;
  showExpenseDialog: boolean;
  setShowExpenseDialog: (show: boolean) => void;
  showSavingsDialog: boolean;
  setShowSavingsDialog: (show: boolean) => void;
  showSalaryModal: boolean;
  setShowSalaryModal: (show: boolean) => void;
  onAddIncome: (income: any) => Promise<void>;
  onAddExpense: (expense: any) => Promise<void>;
  onAddSavings: (savings: any) => Promise<void>;
}

const DashboardModals = ({
  showIncomeDialog,
  setShowIncomeDialog,
  showExpenseDialog,
  setShowExpenseDialog,
  showSavingsDialog,
  setShowSavingsDialog,
  showSalaryModal,
  setShowSalaryModal,
  onAddIncome,
  onAddExpense,
  onAddSavings,
}: DashboardModalsProps) => {
  return (
    <>
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onAddIncome={onAddIncome}
      />

      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onAddExpense={onAddExpense}
      />

      <AddSavingsDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
        onAddSavings={onAddSavings}
      />

      <SetSalaryModal
        open={showSalaryModal}
        onOpenChange={setShowSalaryModal}
      />
    </>
  );
};

export default DashboardModals;