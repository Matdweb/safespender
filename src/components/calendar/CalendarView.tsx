import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarItem, DayData } from '@/types/calendar';
import DayCell from './DayCell';

interface CalendarViewProps {
  currentDate: Date;
  items: CalendarItem[];
  onDateClick: (date: Date) => void;
  getItemsForDate: (date: Date) => CalendarItem[];
}

const CalendarView = ({ currentDate, items, onDateClick, getItemsForDate }: CalendarViewProps) => {
  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate all days for the calendar grid
  const calendarDays: DayData[] = [];
  
  // Previous month's trailing days
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
    const dayItems = getItemsForDate(date);
    calendarDays.push({
      date,
      items: dayItems,
      netFlow: dayItems.reduce((sum, item) => 
        sum + (item.type === 'income' ? item.amount : -item.amount), 0
      ),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today,
      isFuture: date > today,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayItems = getItemsForDate(date);
    calendarDays.push({
      date,
      items: dayItems,
      netFlow: dayItems.reduce((sum, item) => 
        sum + (item.type === 'income' ? item.amount : -item.amount), 0
      ),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today,
      isFuture: date > today,
    });
  }

  // Next month's leading days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    const dayItems = getItemsForDate(date);
    calendarDays.push({
      date,
      items: dayItems,
      netFlow: dayItems.reduce((sum, item) => 
        sum + (item.type === 'income' ? item.amount : -item.amount), 0
      ),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today,
      isFuture: date > today,
    });
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
