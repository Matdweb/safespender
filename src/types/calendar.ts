
export interface CalendarItem {
  id: string;
  type: 'income' | 'expense' | 'borrow';
  title: string;
  amount: number;
  date: string;
  recurring?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
  category?: string;
  description?: string;
}

export interface DayData {
  date: Date;
  items: CalendarItem[];
  netFlow: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}
