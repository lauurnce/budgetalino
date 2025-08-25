import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarComponentProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  onAddEntry: () => void;
  onError: (error: Error) => void;
}

export default function CalendarComponent({ 
  currentDate, 
  onDateChange, 
  onDateClick, 
  onAddEntry,
  onError 
}: CalendarComponentProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/month', year, month],
    retry: false,
    onError: (error: Error) => {
      onError(error);
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group transactions by date
  const transactionsByDate = transactions?.reduce((acc: any, transaction: any) => {
    const date = transaction.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {}) || {};

  const handlePreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const getDateIndicators = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTransactions = transactionsByDate[dateStr] || [];
    
    const incomes = dayTransactions.filter((t: any) => t.type === 'income');
    const expenses = dayTransactions.filter((t: any) => t.type === 'expense');
    
    const indicators = [];
    
    if (incomes.length > 0) {
      indicators.push(
        <div key="income" className="h-1 w-6 bg-success rounded-full mx-auto" title={`Income: $${incomes.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0).toFixed(2)}`}></div>
      );
    }
    
    if (expenses.length > 0) {
      indicators.push(
        <div key="expense" className="h-1 w-4 bg-danger rounded-full mx-auto" title={`Expenses: $${expenses.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0).toFixed(2)}`}></div>
      );
    }
    
    return indicators;
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900" data-testid="text-current-month">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              data-testid="button-previous-month"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
              data-testid="button-next-month"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              className="ml-4 px-4 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark font-medium"
              size="sm"
              onClick={onAddEntry}
              data-testid="button-add-entry-calendar"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Entry
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Previous month padding */}
              {Array.from({ length: monthStart.getDay() }, (_, i) => (
                <div key={`prev-${i}`} className="aspect-square p-2"></div>
              ))}
              
              {/* Current month days */}
              {calendarDays.map((date) => (
                <div
                  key={format(date, 'yyyy-MM-dd')}
                  className={`
                    aspect-square p-2 text-center cursor-pointer rounded-lg transition-colors
                    ${isToday(date) 
                      ? 'bg-blue-primary text-white hover:bg-blue-dark' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onDateClick(date)}
                  data-testid={`calendar-date-${format(date, 'yyyy-MM-dd')}`}
                >
                  <span className={`text-sm font-medium ${isToday(date) ? 'text-white' : 'text-gray-900'}`}>
                    {format(date, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {getDateIndicators(date)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
