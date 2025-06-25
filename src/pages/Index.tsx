
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FreeToSpendCard from '@/components/FreeToSpendCard';
import QuickActions from '@/components/QuickActions';
import UpcomingEvents from '@/components/UpcomingEvents';
import SavingsGoals from '@/components/SavingsGoals';
import TransactionsList from '@/components/TransactionsList';
import AddIncomeDialog from '@/components/AddIncomeDialog';
import AddExpenseDialog from '@/components/AddExpenseDialog';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
  isReserved?: boolean;
}

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  // Calculate balances based on transactions
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const reservedExpenses = transactions
    .filter(t => t.type === 'expense' && t.isReserved)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const assignedSavings = 300; // Static for now
  const freeToSpend = balance - assignedSavings;

  // Sample data for upcoming events and savings goals
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
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'income',
      amount: income.amount,
      description: income.description,
      date: income.date,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Adding income:', income);
    toast({
      title: "Income Added!",
      description: `$${income.amount.toLocaleString()} added to your account`,
    });
  };

  const handleAddExpense = (expense: any) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      category: expense.category,
      isReserved: expense.isReserved,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Adding expense:', expense);
    toast({
      title: "Expense Recorded",
      description: `$${expense.amount.toLocaleString()} ${expense.category} expense added`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "Transaction has been removed",
    });
  };

  const handleAddGoal = () => {
    toast({
      title: "Coming Soon!",
      description: "Goal creation will be available in the next update",
    });
  };

  useEffect(() => {
    document.body.classList.add('animate-fade-in');
  }, []);

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

        {/* Transactions List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <TransactionsList 
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
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
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <h3 className="font-semibold text-primary mb-2">💡 Smart Tip</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
