
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarItem } from '@/types/calendar';
import { DollarSign, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ViewDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  items: CalendarItem[];
  onDeleteItem: (id: string) => void;
  onAddNew: () => void;
}

const ViewDayModal = ({ open, onOpenChange, selectedDate, items, onDeleteItem, onAddNew }: ViewDayModalProps) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="w-4 h-4 text-primary" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-primary';
      case 'expense':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const totalIncome = items.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = items.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const netFlow = totalIncome - totalExpenses;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Financial Items
            {selectedDate && (
              <span className="block text-sm text-muted-foreground font-normal mt-1">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          {items.length > 0 && (
            <Card className="p-4">
              <div className="space-y-2 text-sm">
                {totalIncome > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Income:</span>
                    <span className="text-primary font-medium">+${totalIncome.toLocaleString()}</span>
                  </div>
                )}
                {totalExpenses > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Expenses:</span>
                    <span className="text-destructive font-medium">-${totalExpenses.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Net Flow:</span>
                  <span className={cn(
                    netFlow > 0 ? 'text-primary' : netFlow < 0 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {netFlow > 0 ? '+' : ''}${netFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Items List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map(item => (
              <Card key={item.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getItemIcon(item.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.category && (
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      )}
                      {item.recurring && (
                        <div className="text-xs text-muted-foreground">
                          Repeats {item.recurring.frequency}
                          {item.recurring.interval > 1 && ` (every ${item.recurring.interval})`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium', getItemColor(item.type))}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                    </span>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteItem(item.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {item.description && (
                  <div className="mt-2 text-xs text-muted-foreground pl-7">
                    {item.description}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">No items for this date</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="flex-1 flex items-center gap-2" onClick={onAddNew}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDayModal;
