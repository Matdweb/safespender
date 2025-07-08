import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, DollarSign, TrendingUp, Target, ArrowUpCircle } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import CurrencyDisplay from './CurrencyDisplay';

interface Event {
  id: string;
  type: 'income' | 'expense' | 'savings' | 'borrow';
  title: string;
  amount: number;
  date: string;
  recurring?: boolean;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const { transactions, goals, generateSalaryTransactions, generateRecurringTransactions } = useFinancial();

  // Generate comprehensive upcoming events for next 2 months
  const upcomingEvents = React.useMemo(() => {
    const today = new Date();
    const twoMonthsAhead = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    
    // Get upcoming salary transactions
    const salaryTransactions = generateSalaryTransactions(today, twoMonthsAhead);
    
    // Get recurring expense transactions
    const recurringExpenses = generateRecurringTransactions ? generateRecurringTransactions(today, twoMonthsAhead) : [];
    
    console.log(`Upcoming events: ${salaryTransactions.length} salary transactions, ${recurringExpenses.length} recurring expenses generated`);
    
    // Convert salary transactions to events format
    const salaryEvents: Event[] = salaryTransactions
      .filter(t => {
        const eventDate = new Date(t.date);
        return eventDate >= today && eventDate <= twoMonthsAhead;
      })
      .map(t => ({
        id: t.id,
        type: 'income',
        title: t.description,
        amount: t.amount,
        date: t.date,
        recurring: true
      }));

    // Convert recurring expenses to events format
    const recurringExpenseEvents: Event[] = recurringExpenses
      .filter(t => {
        const eventDate = new Date(t.date);
        return eventDate >= today && eventDate <= twoMonthsAhead;
      })
      .map(t => ({
        id: t.id,
        type: 'expense',
        title: t.description,
        amount: t.amount,
        date: t.date,
        recurring: true
      }));

    // Add any future one-time transactions
    const futureOneTimeEvents: Event[] = transactions
      .filter(t => {
        const eventDate = new Date(t.date);
        return eventDate >= today && eventDate <= twoMonthsAhead;
      })
      .map(t => ({
        id: t.id,
        type: t.type === 'borrow' ? 'borrow' : t.type,
        title: t.description,
        amount: t.amount,
        date: t.date,
        recurring: false
      }));

    // Add savings contributions as events
    const savingsEvents: Event[] = [];
    goals.forEach(goal => {
      if (goal.recurringContribution > 0) {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Generate savings events for next 2 months
        for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
          const contributionDate = new Date(currentYear, currentMonth + monthOffset, 1);
          
          // Adjust based on contribution frequency
          if (goal.contributionFrequency === 'monthly') {
            contributionDate.setDate(1);
          } else if (goal.contributionFrequency === 'biweekly') {
            contributionDate.setDate(15);
          } else if (goal.contributionFrequency === 'weekly') {
            contributionDate.setDate(7);
          }
          
          if (contributionDate >= today && contributionDate <= twoMonthsAhead) {
            savingsEvents.push({
              id: `savings-${goal.id}-${contributionDate.getTime()}`,
              type: 'savings',
              title: goal.name,
              amount: goal.recurringContribution,
              date: contributionDate.toISOString().split('T')[0],
              recurring: true
            });
          }
        }
      }
    });

    // Combine and sort all events by date
    const allEvents = [...salaryEvents, ...recurringExpenseEvents, ...futureOneTimeEvents, ...savingsEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 20); // Limit to first 20 events

    console.log(`Total upcoming events: ${allEvents.length}`);
    return allEvents;
  }, [transactions, goals, generateSalaryTransactions, generateRecurringTransactions]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="w-4 h-4 text-finance-primary" />;
      case 'expense':
        return <TrendingUp className="w-4 h-4 text-finance-neutral-600 dark:text-finance-neutral-400 rotate-180" />;
      case 'savings':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'borrow':
        return <ArrowUpCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'border-l-finance-primary bg-finance-primary/5';
      case 'expense':
        return 'border-l-destructive bg-destructive/5';
      case 'savings':
        return 'border-l-blue-600 bg-blue-50 dark:bg-blue-700/10';
      case 'borrow':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-700/10';
      default:
        return 'border-l-finance-neutral-300 bg-finance-neutral-50 dark:bg-finance-neutral-900';
    }
  };

  return (
    <Card className="p-6 card-border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-finance-primary" />
        <h3 className="font-semibold">Upcoming Events (Next 2 Months)</h3>
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3 pr-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-subtle text-center py-8">
              No upcoming events. Add some income or expenses to get started!
            </p>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getEventColor(event.type)}`}
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <p className="font-medium text-sm">
                      {event.title}
                      {event.type === 'borrow' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Advance
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-subtle">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {event.recurring && ' • Recurring'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    event.type === 'income' ? 'text-finance-primary' : 
                    event.type === 'expense' ? 'text-finance-neutral-600 dark:text-finance-neutral-400' : 
                    event.type === 'borrow' ? 'text-blue-600' :
                    'text-blue-600'
                  }`}>
                    {event.type === 'income' || event.type === 'borrow' ? '+' : '-'}
                    <CurrencyDisplay amount={event.amount} className="inline" />
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default UpcomingEvents;
