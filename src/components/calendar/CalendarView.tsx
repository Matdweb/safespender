import React from 'react';
import { Card } from '@/components/ui/card';
import { DayData } from '@/types/calendar';
import DayCell from './DayCell';
import { CalendarTransaction } from '@/hooks/useSimplifiedCalendar';

interface CalendarViewProps {
  currentDate: Date;
  items: CalendarTransaction[];
  onDateClick: (date: Date) => void;
  getItemsForDate: (date: Date) => CalendarTransaction[];
}

const CalendarView = ({ currentDate, items, onDateClick, getItemsForDate }: CalendarViewProps) => {
  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const filterSavingsOnlyOn16th = (date: Date, items: CalendarTransaction[]) => {
    return items.filter(item => {
      if (item.type === 'saving') {
        return date.getDate() === 16;
      }
      return true; // All non-savings are shown as normal
    });
  };

  const buildDayData = (date: Date): DayData => {
    const rawItems = getItemsForDate(date);
    const dayItems = filterSavingsOnlyOn16th(date, rawItems);
    return {
      date,
      items: dayItems,
      netFlow: dayItems.reduce((sum, item) =>
        sum + (item.type === 'income' ? item.amount : -item.amount), 0
      ),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today,
      isFuture: date > today,
    };
  };

  const calendarDays: DayData[] = [];

  // Previous month's trailing days
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
    calendarDays.push(buildDayData(date));
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push(buildDayData(date));
  }

  // Next month's leading days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    calendarDays.push(buildDayData(date));
  }

  return (
    <Card className="p-6">
      {/* Header with day names */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayData, index) => (
          <DayCell
            key={index}
            dayData={dayData}
            onClick={() => onDateClick(dayData.date)}
            isCurrentMonth={dayData.date.getMonth() === currentDate.getMonth()}
          />
        ))}
      </div>
    </Card>
  );
};

export default CalendarView;
