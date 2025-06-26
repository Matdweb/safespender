
import React, { useState } from 'react';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import AddItemModal from '@/components/calendar/AddItemModal';
import ViewDayModal from '@/components/calendar/ViewDayModal';
import { CalendarItem } from '@/types/calendar';

const Calendar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const hasItems = calendarItems.some(item => 
      new Date(item.date).toDateString() === date.toDateString()
    );
    
    if (hasItems) {
      setShowViewModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddItem = (item: Omit<CalendarItem, 'id'>) => {
    const newItem: CalendarItem = {
      ...item,
      id: Date.now().toString(),
    };
    setCalendarItems(prev => [...prev, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setCalendarItems(prev => prev.filter(item => item.id !== id));
  };

  const getItemsForDate = (date: Date) => {
    return calendarItems.filter(item => 
      new Date(item.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <CalendarHeader 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAddClick={() => setShowAddModal(true)}
          />
          
          <CalendarView
            currentDate={currentDate}
            items={calendarItems}
            onDateClick={handleDateClick}
            getItemsForDate={getItemsForDate}
          />
        </div>
      </main>

      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        selectedDate={selectedDate}
        onAddItem={handleAddItem}
      />

      <ViewDayModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        selectedDate={selectedDate}
        items={selectedDate ? getItemsForDate(selectedDate) : []}
        onDeleteItem={handleDeleteItem}
        onAddNew={() => {
          setShowViewModal(false);
          setShowAddModal(true);
        }}
      />
    </div>
  );
};

export default Calendar;
