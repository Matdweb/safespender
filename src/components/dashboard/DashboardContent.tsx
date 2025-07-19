import React from 'react';
import FreeToSpendCard from '@/components/FreeToSpendCard';
import QuickActions from '@/components/QuickActions';
import UpcomingEvents from '@/components/UpcomingEvents';
import SavingsGoals from '@/components/SavingsGoals';
import TransactionsList from '@/components/TransactionsList';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number | string;
  description: string;
  date: string;
  category?: string;
  created_at?: string;
}

interface UpcomingEvent {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  recurring: boolean;
}

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  recurring_contribution?: number;
  contribution_frequency?: string;
  icon?: string;
}

interface DashboardContentProps {
  freeToSpend: number;
  totalIncome: number;
  totalExpenses: number;
  reservedExpenses: number;
  assignedSavings: number;
  transactions: Transaction[];
  upcomingEvents: UpcomingEvent[];
  goals: SavingsGoal[];
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddSavings: () => void;
  onSetSalary: () => void;
}

const DashboardContent = ({
  freeToSpend,
  totalIncome,
  totalExpenses,
  reservedExpenses,
  assignedSavings,
  transactions,
  upcomingEvents,
  goals,
  onAddIncome,
  onAddExpense,
  onAddSavings,
  onSetSalary,
}: DashboardContentProps) => {
  const { toast } = useToast();

  const handleAddGoal = () => {
    toast({
      title: "Use the Goals page!",
      description: "Visit the Goals section to create and manage your savings goals",
    });
  };

  return (
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
      <div className="animate-scale-in" data-tour="free-to-spend">
        <FreeToSpendCard
          amount={freeToSpend}
          balance={totalIncome - totalExpenses}
          reservedExpenses={reservedExpenses}
          assignedSavings={assignedSavings}
        />
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }} data-tour="quick-actions">
        <QuickActions
          onAddIncome={onAddIncome}
          onAddExpense={onAddExpense}
          onAddSavings={onAddSavings}
          onSetSalary={onSetSalary}
          onViewCalendar={() => toast({ title: "Calendar", description: "Click the Calendar link in the header" })}
          onViewGoals={() => toast({ title: "Goals", description: "Click the Goals link in the header" })}
        />
      </div>

      {/* Transactions List */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <TransactionsList 
          transactions={transactions}
          onDeleteTransaction={() => {}}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }} data-tour="calendar-section">
          <UpcomingEvents events={upcomingEvents} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }} data-tour="goals-overview">
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
  );
};

export default DashboardContent;