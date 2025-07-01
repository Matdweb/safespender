
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, Target } from 'lucide-react';

interface Event {
  id: string;
  type: 'income' | 'expense' | 'savings';
  title: string;
  amount: number;
  date: string;
  recurring?: boolean;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="w-4 h-4 text-finance-primary" />;
      case 'expense':
        return <TrendingUp className="w-4 h-4 text-finance-neutral-600 dark:text-finance-neutral-400 rotate-180" />;
      case 'savings':
        return <Target className="w-4 h-4 text-finance-primary" />;
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
        return 'border-l-finance-teal-500 bg-finance-teal-50 dark:bg-finance-teal-700/10';
      default:
        return 'border-l-finance-neutral-300 bg-finance-neutral-50 dark:bg-finance-neutral-900';
    }
  };

  return (
    <Card className="p-6 card-border min-h-60">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-finance-primary" />
        <h3 className="font-semibold">Upcoming Events</h3>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-subtle text-center py-8">
            No upcoming events. Add some income or expenses to get started!
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getEventColor(event.type)}`}
            >
              <div className="flex items-center gap-3">
                {getEventIcon(event.type)}
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
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
                  'text-finance-teal-600 dark:text-finance-teal-500'
                }`}>
                  {event.type === 'income' ? '+' : '-'}${event.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default UpcomingEvents;
