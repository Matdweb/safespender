
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import TourAutoStarter from '@/components/tour/TourAutoStarter';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardModals from '@/components/dashboard/DashboardModals';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { useUnifiedFreeToSpend } from '@/hooks/useUnifiedFreeToSpend';
import { useDashboardHandlers } from '@/hooks/useDashboardHandlers';
import { useUpcomingEvents } from '@/hooks/useUpcomingEvents';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number | string;
  description: string;
  date: string;
  category?: string;
  created_at?: string;
}

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const {
    transactions,
    goals,
    salary,
    generateSalaryTransactions,
    isLoading: dashboardLoading
  } = useFinancialDashboard();

  // Use the new unified calculation system
  const {
    totalIncome,
    reservedForBills: reservedExpenses,
    assignedToSavings,
    freeToSpend,
    currentBalance,
    isLoading: calculationsLoading
  } = useUnifiedFreeToSpend();

  const isLoading = dashboardLoading || calculationsLoading;

  const { handleAddIncome, handleAddExpense, handleAddSavings } = useDashboardHandlers();
  
  // Cast transactions to proper type for upcoming events
  const typedTransactions = transactions?.map(t => ({
    ...t,
    type: t.type as 'income' | 'expense' | 'savings'
  }));
  
  const upcomingEvents = useUpcomingEvents(typedTransactions, goals, salary, generateSalaryTransactions);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    document.body.classList.add('animate-fade-in');
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Convert database transactions to component format
  const convertedTransactions: Transaction[] = transactions ? transactions.map(t => ({
    id: t.id,
    type: t.type as 'income' | 'expense' | 'savings',
    amount: t.amount,
    description: t.description,
    date: t.date,
    category: t.category || undefined,
    created_at: t.created_at
  })) : [];

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <TourAutoStarter />
      
      <DashboardContent
        freeToSpend={freeToSpend}
        totalIncome={currentBalance} // Show current balance as total income
        totalExpenses={currentBalance - totalIncome} // Calculate expenses from balance
        reservedExpenses={reservedExpenses}
        assignedSavings={assignedToSavings}
        transactions={convertedTransactions}
        upcomingEvents={upcomingEvents}
        goals={goals || []}
        onAddIncome={() => setShowIncomeDialog(true)}
        onAddExpense={() => setShowExpenseDialog(true)}
        onAddSavings={() => setShowSavingsDialog(true)}
        onSetSalary={() => setShowSalaryModal(true)}
      />

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
    </div>
  );
};

export default Index;
