
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DayData } from '@/types/calendar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface DayCellProps {
  dayData: DayData;
  onClick: () => void;
  isCurrentMonth: boolean;
}

const DayCell = ({ dayData, onClick, isCurrentMonth }: DayCellProps) => {
  const adjustedDate = new Date(dayData.date);
  adjustedDate.setDate(adjustedDate.getDate());
  const { items, netFlow, isToday, isPast } = dayData;

  const [isHovered, setIsHovered] = useState(false);

  const incomeItems = items.filter(item => item.type === 'income');
  const expenseItems = items.filter(item => item.type === 'expense');
  const savingsItems = items.filter(item => item.type === 'savings');
  const borrowItems = items.filter(item => item.type === 'borrow');

  const getNetFlowColor = () => {
    if (netFlow > 0) return 'text-primary';
    if (netFlow < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const dayContent = (
    <div
      className={cn(
        'relative p-2 sm:p-3 min-h-[60px] sm:min-h-[80px] border rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-accent/50 hover:border-accent-foreground/20',
        'active:scale-95 touch-manipulation',
        isToday && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
        !isCurrentMonth && 'opacity-40',
        isPast && isCurrentMonth && 'bg-muted/20',
        items.length > 0 && 'border-accent-foreground/30'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Date number */}
      <div className={cn(
        'text-xs sm:text-sm font-medium mb-1 sm:mb-2',
        isToday ? 'text-primary font-bold' : 'text-foreground'
      )}>
        {adjustedDate.getDate()}
      </div>

      {/* Mobile-friendly indicators - dots for different types */}
      <div className="flex items-center gap-1 mb-1">
        {incomeItems.length > 0 && (
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary flex-shrink-0"
            title={`${incomeItems.length} income item(s)`} />
        )}
        {expenseItems.length > 0 && (
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive flex-shrink-0"
            title={`${expenseItems.length} expense item(s)`} />
        )}
        {savingsItems.length > 0 && (
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-600 flex-shrink-0"
            title={`${savingsItems.length} savings item(s)`} />
        )}
        {borrowItems.length > 0 && (
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500 flex-shrink-0"
            title={`${borrowItems.length} borrow item(s)`} />
        )}
      </div>

      {/* Net flow indicator - smaller on mobile */}
      {netFlow !== 0 && (
        <div className={cn('text-xs font-medium truncate', getNetFlowColor())}>
          {netFlow > 0 ? '+' : ''}${Math.abs(netFlow) >= 1000 ?
            `${(Math.abs(netFlow) / 1000).toFixed(1)}k` :
            Math.abs(netFlow).toLocaleString()}
        </div>
      )}

      {/* Show add button on mobile/touch for empty days */}
      {items.length === 0 && isCurrentMonth && (
        <div className="absolute inset-0 hidden items-center justify-center bg-accent/10 rounded-lg sm:flex sm:opacity-0 hover:opacity-1 touch-manipulation">
          <span className="text-xs text-muted-foreground">Tap to add</span>
        </div>
      )}
      
      {/* Hover effect - only on larger screens */}
      {isHovered && items.length === 0 && (
        <div className="absolute inset-0 hidden sm:flex items-center justify-center bg-accent/10 rounded-lg">
          <span className="text-xs text-muted-foreground">Click to add</span>
        </div>
      )}
    </div>
  );

  if (items.length === 0) {
    return dayContent;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {dayContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-3">
        <div className="space-y-2">
          <div className="font-medium text-sm">
            {adjustedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>

          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="truncate">{item.title}</span>
              <span className={cn(
                'font-medium',
                item.type === 'income' ? 'text-primary' :
                  item.type === 'savings' ? 'text-blue-600' :
                    item.type === 'borrow' ? 'text-orange-500' : 'text-destructive'
              )}>
                {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
              </span>
            </div>
          ))}

          {netFlow !== 0 && (
            <div className="border-t pt-2 flex justify-between items-center text-xs font-medium">
              <span>Net Flow:</span>
              <span className={getNetFlowColor()}>
                {netFlow > 0 ? '+' : ''}${Math.abs(netFlow).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DayCell;
