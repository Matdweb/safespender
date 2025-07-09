
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FreeToSpendCard from '@/components/FreeToSpendCard';
import QuickActions from '@/components/QuickActions';
import UpcomingEvents from '@/components/UpcomingEvents';
import SavingsGoals from '@/components/SavingsGoals';
import TransactionsList from '@/components/TransactionsList';
import AddIncomeDialog from '@/components/AddIncomeDialog';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import AddSavingsDialog from '@/components/AddSavingsDialog';
import SetSalaryModal from '@/components/SetSalaryModal';
import LoadingScreen from '@/components/LoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { useCreateTransaction, useCreateSavingsGoal, useUpdateSalaryConfiguration, useCreateSalaryConfiguration } from '@/hooks/useFinancialData';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const { toast } = useToast();

  const {
    transactions,
    goals,
    salary,
    totalIncome,
    totalExpenses,
    reservedExpenses,
    assignedSavings,
    freeToSpend,
    generateSalaryTransactions,
    isLoading
  } = useFinancialDashboard();

  const createTransactionMutation = useCreateTransaction();
  const createSavingsGoalMutation = useCreateSavingsGoal();
  const updateSalaryMutation = useUpdateSalaryConfiguration();
  const createSalaryMutation = useCreateSalaryConfiguration();

  // Generate upcoming events from salary and goals
  const upcomingEvents = React.useMemo(() => {
    if (!transactions || !goals) return [];
    
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    const salaryTransactions = generateSalaryTransactions(now, nextMonth);
    
    return [
      // Add salary transactions as upcoming events
      ...salaryTransactions.slice(0, 3).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        title: t.description,
        amount: t.amount,
        date: t.date,
        recurring: true
      })),
      // Add future transactions
      ...transactions
        .filter(t => new Date(t.date) > now)
        .slice(0, 3)
        .map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          title: t.description,
          amount: parseFloat(t.amount.toString()),
          date: t.date,
          recurring: false
        }))
    ];
  }, [transactions, goals, generateSalaryTransactions]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAddIncome = async (income: any) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'income',
        amount: income.amount,
        description: income.description,
        date: income.date
      });
      
      toast({
        title: "Income Added!",
        description: `$${income.amount.toLocaleString()} added to your account`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add income",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async (expense: any) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'expense',
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        category: expense.category,
        is_reserved: expense.isReserved,
      });
      
      toast({
        title: "Expense Recorded",
        description: `$${expense.amount.toLocaleString()} ${expense.category} expense added`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const handleAddGoal = () => {
    toast({
      title: "Use the Goals page!",
      description: "Visit the Goals section to create and manage your savings goals",
    });
  };

  const handleAddSavings = async (savings: { goalId: string; amount: number; description: string }) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: 'savings',
        amount: savings.amount,
        description: savings.description,
        date: new Date().toISOString().split('T')[0],
        goal_id: savings.goalId,
      });
      
      toast({
        title: "Savings Added!",
        description: `$${savings.amount.toLocaleString()} added to your savings goal`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings",
        variant: "destructive"
      });
    }
  };

  const handleSetSalary = async (salaryData: any) => {
    try {
      if (salary) {
        await updateSalaryMutation.mutateAsync(salaryData);
      } else {
        await createSalaryMutation.mutateAsync(salaryData);
      }
      
      toast({
        title: "Salary Configuration Updated!",
        description: "Your salary schedule has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save salary configuration",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    document.body.classList.add('animate-fade-in');
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Here's your financial overview for today
          </p>
        </div>

        {/* Free to Spend Card - Hero */}
        <div className="animate-scale-in">
          <FreeToSpendCard
            amount={freeToSpend}
            balance={totalIncome - totalExpenses}
            reservedExpenses={reservedExpenses}
            assignedSavings={assignedSavings}
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <QuickActions
            onAddIncome={() => setShowIncomeDialog(true)}
            onAddExpense={() => setShowExpenseDialog(true)}
            onAddSavings={() => setShowSavingsDialog(true)}
            onSetSalary={() => setShowSalaryModal(true)}
            onViewCalendar={() => toast({ title: "Calendar", description: "Click the Calendar link in the header" })}
            onViewGoals={() => toast({ title: "Goals", description: "Click the Goals link in the header" })}
          />
        </div>

        {/* Transactions List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <TransactionsList 
            transactions={transactions || []}
            onDeleteTransaction={() => {}}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <UpcomingEvents events={upcomingEvents} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <SavingsGoals goals={goals || []} onAddGoal={handleAddGoal} />
          </div>
        </div>

        {/* Quick Tip */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <h3 className="font-semibold text-primary mb-2">💡 Smart Tip</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Your "Free to Spend" amount automatically accounts for your programmed salary, upcoming bills, and savings goals. 
              Set up your salary configuration to get the most accurate calculations.
            </p>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        onAddIncome={handleAddIncome}
      />

      <AddExpenseDialog
        open={showExpenseDialog}
        onOpenChange={setShowExpenseDialog}
        onAddExpense={handleAddExpense}
      />

      <AddSavingsDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
        onAddSavings={handleAddSavings}
      />

      <SetSalaryModal
        open={showSalaryModal}
        onOpenChange={setShowSalaryModal}
        onSetSalary={handleSetSalary}
        currentSalary={salary}
      />
    </div>
  );
};

export default Index;
