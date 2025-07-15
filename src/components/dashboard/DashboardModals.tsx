import React from 'react';
import AddIncomeDialog from '@/components/AddIncomeDialog';
import UnifiedExpenseDialog from '@/components/UnifiedExpenseDialog';
import ExtraContributionDialog from '@/components/ExtraContributionDialog';
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
  onAddExpense: (expense: {
    title: string;
    category: string;
    amount: number;
    type: 'one-time' | 'monthly';
    date?: string;
    day_of_month?: number;
  }) => Promise<void>;
  
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
}: DashboardModalsProps) => {
  return (
    <>
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onAddIncome={onAddIncome}
      />

      <UnifiedExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onAddExpense={onAddExpense}
      />

      <ExtraContributionDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
      />

      <SetSalaryModal
        open={showSalaryModal}
        onOpenChange={setShowSalaryModal}
      />
    </>
  );
};

export default DashboardModals;