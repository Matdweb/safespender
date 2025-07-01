
import React, { useState } from 'react';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import AddItemModal from '@/components/calendar/AddItemModal';
import ViewDayModal from '@/components/calendar/ViewDayModal';
import { CalendarItem } from '@/types/calendar';
import { useFinancial } from '@/contexts/FinancialContext';

const Calendar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    generateRecurringTransactions 
  } = useFinancial();

  // Convert transactions to calendar items and include recurring ones
  const calendarItems: CalendarItem[] = React.useMemo(() => {
    // Get base transactions
    const baseItems = transactions.map(t => ({
      id: t.id,
      type: t.type,
      title: t.description,
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
      recurring: t.recurring ? {
        frequency: t.recurring.type === 'biweekly' ? 'monthly' as const : t.recurring.type,
        interval: t.recurring.interval
      } : undefined
    }));

    // Generate recurring transactions for a limited period (3 months ahead only)
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);
    
    console.log(`Generating recurring transactions from ${startOfMonth.toDateString()} to ${endOfPeriod.toDateString()}`);
    
    const recurringTransactions = generateRecurringTransactions(startOfMonth, endOfPeriod);
    
    console.log(`Generated ${recurringTransactions.length} recurring transactions`);
    
    const recurringItems = recurringTransactions.map(t => ({
      id: t.id,
      type: t.type,
      title: t.description,
      amount: t.amount,
      date: t.date,
      category: t.category,
      description: t.description,
      recurring: {
        frequency: t.recurring?.type === 'biweekly' ? 'monthly' as const : t.recurring?.type || 'monthly' as const,
        interval: t.recurring?.interval || 1
      }
    }));

    const allItems = [...baseItems, ...recurringItems];
    console.log(`Total calendar items: ${allItems.length}`);
    
    return allItems;
  }, [transactions, currentDate, generateRecurringTransactions]);

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
    console.log('Adding new transaction:', item.title, item.amount);
    addTransaction({
      type: item.type,
      amount: item.amount,
      description: item.title,
      date: item.date,
      category: item.category,
      recurring: item.recurring ? {
        type: item.recurring.frequency === 'weekly' ? 'weekly' : 
              item.recurring.frequency === 'yearly' ? 'monthly' :
              item.recurring.frequency,
        interval: item.recurring.interval
      } : undefined
    });
  };

  const handleDeleteItem = (id: string) => {
    console.log('Deleting transaction:', id);
    deleteTransaction(id);
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
