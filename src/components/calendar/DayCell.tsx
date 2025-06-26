
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DayData } from '@/types/calendar';
import { DollarSign, TrendingDown, ArrowUpCircle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface DayCellProps {
  dayData: DayData;
  onClick: () => void;
  isCurrentMonth: boolean;
}

const DayCell = ({ dayData, onClick, isCurrentMonth }: DayCellProps) => {
  const { date, items, netFlow, isToday, isPast } = dayData;
  const [isHovered, setIsHovered] = useState(false);

  const incomeItems = items.filter(item => item.type === 'income');
  const expenseItems = items.filter(item => item.type === 'expense');
  const transferItems = items.filter(item => item.type === 'transfer');

  const getNetFlowColor = () => {
    if (netFlow > 0) return 'text-primary';
    if (netFlow < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const dayContent = (
    <div
      className={cn(
        'relative p-3 min-h-[80px] border rounded-lg cursor-pointer transition-all duration-200',
        'hover:bg-accent/50 hover:border-accent-foreground/20',
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
        'text-sm font-medium mb-2',
        isToday ? 'text-primary font-bold' : 'text-foreground'
      )}>
        {date.getDate()}
      </div>

      {/* Item indicators */}
      <div className="flex items-center gap-1 mb-2">
        {incomeItems.length > 0 && (
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
            <DollarSign className="w-2.5 h-2.5 text-primary" />
          </div>
        )}
        {expenseItems.length > 0 && (
          <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <TrendingDown className="w-2.5 h-2.5 text-destructive" />
          </div>
        )}
        {transferItems.length > 0 && (
          <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <ArrowUpCircle className="w-2.5 h-2.5 text-blue-600" />
          </div>
        )}
      </div>

      {/* Net flow indicator */}
      {netFlow !== 0 && (
        <div className={cn('text-xs font-medium', getNetFlowColor())}>
          {netFlow > 0 ? '+' : ''}${Math.abs(netFlow).toLocaleString()}
        </div>
      )}

      {/* Hover effect */}
      {isHovered && items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent/10 rounded-lg">
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
            {date.toLocaleDateString('en-US', { 
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
                item.type === 'income' ? 'text-primary' : 'text-destructive'
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
