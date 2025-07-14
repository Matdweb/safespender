
import React, { useState } from 'react';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import AddItemModal from '@/components/calendar/AddItemModal';
import ViewDayModal from '@/components/calendar/ViewDayModal';
import LoadingScreen from '@/components/LoadingScreen';
import { CalendarItem } from '@/types/calendar';
import { useEnhancedCalendar } from '@/hooks/useEnhancedCalendar';
import { useCreateTransaction, useDeleteTransaction } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';

const Calendar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const { calendarItems, getItemsForDate, isLoading } = useEnhancedCalendar(currentDate);
  const createTransactionMutation = useCreateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const { toast } = useToast();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const hasItems = getItemsForDate(date).length > 0;
    
    if (hasItems) {
      setShowViewModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddItem = async (item: Omit<CalendarItem, 'id'>) => {
    try {
      await createTransactionMutation.mutateAsync({
        type: item.type === 'borrow' ? 'income' : item.type,
        amount: item.amount,
        description: item.title,
        date: item.date,
        category: item.category || (item.type === 'borrow' ? 'advance' : undefined),
      });
      
      toast({
        title: "Item Added!",
        description: `${item.title} has been added to your calendar`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    // Only delete if it's not a generated salary transaction
    if (id.startsWith('salary-') || id.startsWith('savings-')) {
      toast({
        title: "Cannot Delete",
        description: "Generated transactions cannot be deleted directly",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteTransactionMutation.mutateAsync(id);
      toast({
        title: "Item Deleted",
        description: "Transaction has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  // Convert CalendarTransactions to CalendarItems for component compatibility
  const convertedCalendarItems: CalendarItem[] = calendarItems.map(item => ({
    id: item.id,
    type: item.type as 'income' | 'expense' | 'savings',
    title: item.title,
    amount: item.amount,
    date: item.date,
    category: item.category,
    description: item.description,
  }));

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
        items={selectedDate ? convertedGetItemsForDate(selectedDate) : []}
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
