
import React, { useState } from 'react';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import ViewDayModal from '@/components/calendar/ViewDayModal';
import LoadingScreen from '@/components/LoadingScreen';
import { CalendarItem } from '@/types/calendar';
import { useEnhancedCalendar } from '@/hooks/useEnhancedCalendar';

const Calendar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { calendarItems, getItemsForDate, isLoading } = useEnhancedCalendar(currentDate);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const hasItems = getItemsForDate(date).length > 0;
    
    if (hasItems) {
      setShowViewModal(true);
    }
    // For empty days, the calendar cells now handle their own add buttons
  };

  const handleDeleteItem = async (id: string) => {
    // The deletion is handled in the ViewDayModal component
    // We just need to refresh the calendar data, which happens automatically
    // through the React Query invalidation in the hooks
  };

  // Convert CalendarTransactions to CalendarItems for component compatibility
  const convertedGetItemsForDate = (date: Date): CalendarItem[] => {
    const items = getItemsForDate(date);
    return items.map(item => ({
      id: item.id,
      type: item.type as 'income' | 'expense' | 'savings',
      title: item.title,
      amount: item.amount,
      date: item.date,
      category: item.category,
      description: item.description,
    }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <CalendarHeader 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
          
          <CalendarView
            currentDate={currentDate}
            items={calendarItems}
            onDateClick={handleDateClick}
            getItemsForDate={getItemsForDate}
          />
        </div>
      </main>

      <ViewDayModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        selectedDate={selectedDate}
        items={selectedDate ? convertedGetItemsForDate(selectedDate) : []}
        onDeleteItem={handleDeleteItem}
        onAddNew={() => {
          setShowViewModal(false);
          // Individual calendar cells now handle their own add actions
        }}
      />
    </div>
  );
};

export default Calendar;
