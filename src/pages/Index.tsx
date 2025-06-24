
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FreeToSpendCard from '@/components/FreeToSpendCard';
import QuickActions from '@/components/QuickActions';
import UpcomingEvents from '@/components/UpcomingEvents';
import SavingsGoals from '@/components/SavingsGoals';
import AddIncomeDialog from '@/components/AddIncomeDialog';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const { toast } = useToast();

  // Sample data - in a real app, this would come from a database
  const [balance] = useState(2450);
  const [reservedExpenses] = useState(850);
  const [assignedSavings] = useState(300);
  const freeToSpend = balance - reservedExpenses - assignedSavings;

  const [upcomingEvents] = useState([
    {
      id: '1',
      type: 'income' as const,
      title: 'Freelance Payment',
      amount: 1200,
      date: '2024-06-28',
      recurring: false
    },
    {
      id: '2',
      type: 'expense' as const,
      title: 'Rent',
      amount: 1200,
      date: '2024-07-01',
      recurring: true
    },
    {
      id: '3',
      type: 'savings' as const,
      title: 'Emergency Fund',
      amount: 200,
      date: '2024-06-30',
      recurring: true
    }
  ]);

  const [savingsGoals] = useState([
    {
      id: '1',
      title: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 2800,
      deadline: '2024-12-31'
    },
    {
      id: '2',
      title: 'Vacation',
      targetAmount: 1500,
      currentAmount: 450,
      deadline: '2024-09-01'
    }
  ]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAddIncome = (income: any) => {
    console.log('Adding income:', income);
    toast({
      title: "Income Added!",
      description: `$${income.amount.toLocaleString()} added to your account`,
    });
  };

  const handleAddExpense = (expense: any) => {
    console.log('Adding expense:', expense);
    toast({
      title: "Expense Recorded",
      description: `$${expense.amount.toLocaleString()} ${expense.category} expense added`,
    });
  };

  const handleAddGoal = () => {
    toast({
      title: "Coming Soon!",
      description: "Goal creation will be available in the next update",
    });
  };

  useEffect(() => {
    // Add initial animation to page load
    document.body.classList.add('animate-fade-in');
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your financial overview for today
          </p>
        </div>

        {/* Free to Spend Card - Hero */}
        <div className="animate-scale-in">
          <FreeToSpendCard
            amount={freeToSpend}
            balance={balance}
            reservedExpenses={reservedExpenses}
            assignedSavings={assignedSavings}
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <QuickActions
            onAddIncome={() => setShowIncomeDialog(true)}
            onAddExpense={() => setShowExpenseDialog(true)}
            onViewCalendar={() => toast({ title: "Coming Soon!", description: "Calendar view is in development" })}
            onViewGoals={() => toast({ title: "Coming Soon!", description: "Goals page is in development" })}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <UpcomingEvents events={upcomingEvents} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <SavingsGoals goals={savingsGoals} onAddGoal={handleAddGoal} />
          </div>
        </div>

        {/* Quick Tip */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="bg-finance-teal/5 border border-finance-teal/20 rounded-2xl p-6 text-center">
            <h3 className="font-semibold text-finance-teal-dark mb-2">💡 Smart Tip</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reserve money for upcoming bills to keep your "Free to Spend" amount accurate. 
              This helps prevent overspending and builds better financial habits.
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
    </div>
  );
};

export default Index;
