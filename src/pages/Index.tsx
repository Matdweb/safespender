import React, { useState } from 'react';
import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import FreeToSpendCard from '@/components/FreeToSpendCard';
import SavingsGoals from '@/components/SavingsGoals';
import TransactionsList from '@/components/TransactionsList';
import UpcomingEvents from '@/components/UpcomingEvents';
import LoadingScreen from '@/components/LoadingScreen';
import TourAutoStarter from '@/components/tour/TourAutoStarter';
import UnifiedTransactionModal from '@/components/modals/UnifiedTransactionModal';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  
  const { isLoading } = useFinancialDashboard();
  const navigate = useNavigate();

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <QuickActions
            onAddIncome={() => openIncomeModal()}
            onAddExpense={() => openExpenseModal()}
            onAddSavings={() => openSavingsModal()}
            onSetSalary={() => setShowSalaryModal(true)}
            onViewCalendar={() => navigate('/calendar')}
            onViewGoals={() => navigate('/goals')}
          />
          
          <FreeToSpendCard />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <SavingsGoals 
                goals={[]}
                onAddGoal={() => navigate('/goals')}
              />
            </div>
            
            <div className="space-y-8">
              <TransactionsList transactions={[]} />
              <UpcomingEvents events={[]} />
            </div>
          </div>
        </div>
      </main>

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
      
      <TourAutoStarter />
    </div>
  );
};

export default Index;