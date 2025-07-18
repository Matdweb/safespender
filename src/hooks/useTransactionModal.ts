import { useState } from 'react';

interface UseTransactionModalReturn {
  isIncomeModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isSavingsModalOpen: boolean;
  modalDate: Date | undefined;
  modalTitle: string;
  openIncomeModal: (date?: Date) => void;
  openExpenseModal: (date?: Date) => void;
  openSavingsModal: (date?: Date) => void;
  closeAllModals: () => void;
}

export const useTransactionModal = (): UseTransactionModalReturn => {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | undefined>();
  const [modalTitle, setModalTitle] = useState('');

  const openIncomeModal = (date?: Date) => {
    setModalDate(date);
    setModalTitle(date ? `Add Income for ${date.toLocaleDateString()}` : 'Add Income');
    setIsIncomeModalOpen(true);
  };

  const openExpenseModal = (date?: Date) => {
    setModalDate(date);
    setModalTitle(date ? `Add Expense for ${date.toLocaleDateString()}` : 'Add Expense');
    setIsExpenseModalOpen(true);
  };

  const openSavingsModal = (date?: Date) => {
    setModalDate(date);
    setModalTitle(date ? `Add Savings for ${date.toLocaleDateString()}` : 'Add Savings Contribution');
    setIsSavingsModalOpen(true);
  };

  const closeAllModals = () => {
    setIsIncomeModalOpen(false);
    setIsExpenseModalOpen(false);
    setIsSavingsModalOpen(false);
    setModalDate(undefined);
    setModalTitle('');
  };

  return {
    isIncomeModalOpen,
    isExpenseModalOpen,
    isSavingsModalOpen,
    modalDate,
    modalTitle,
    openIncomeModal,
    openExpenseModal,
    openSavingsModal,
    closeAllModals,
  };
};