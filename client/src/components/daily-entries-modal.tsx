import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface DailyEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onAddEntry: () => void;
  onEditEntry: (transaction: any) => void;
  onError: (error: Error) => void;
}

export default function DailyEntriesModal({
  isOpen,
  onClose,
  selectedDate,
  onAddEntry,
  onEditEntry,
  onError
}: DailyEntriesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions', dateStr, dateStr],
    enabled: isOpen && !!selectedDate,
    retry: false,
    onError: (error: Error) => {
      onError(error);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      await apiRequest('DELETE', `/api/transactions/${transactionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
    onError: (error: Error) => {
      onError(error);
    },
  });

  if (!selectedDate) return null;

  const dayTransactions = transactions || [];
  const incomes = dayTransactions.filter((t: any) => t.type === 'income');
  const expenses = dayTransactions.filter((t: any) => t.type === 'expense');
  
  const dayIncome = incomes.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
  const dayExpenses = expenses.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const categoryColors: Record<string, string> = {
    food: 'bg-orange-100 text-orange-800',
    transportation: 'bg-blue-100 text-blue-800',
    entertainment: 'bg-purple-100 text-purple-800',
    rent: 'bg-red-100 text-red-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    shopping: 'bg-green-100 text-green-800',
    healthcare: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" data-testid="modal-daily-entries">
        <DialogHeader>
          <DialogTitle data-testid="text-selected-date">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <>
              {/* Daily Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg" data-testid="card-day-income">
                  <p className="text-sm text-success font-medium">Day Income</p>
                  <p className="text-xl font-bold text-success" data-testid="text-day-income">
                    ${dayIncome.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg" data-testid="card-day-expenses">
                  <p className="text-sm text-danger font-medium">Day Expenses</p>
                  <p className="text-xl font-bold text-danger" data-testid="text-day-expenses">
                    ${dayExpenses.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Entries List */}
              <div className="space-y-4">
                {dayTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500" data-testid="text-no-entries">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No transactions for this day</p>
                  </div>
                ) : (
                  dayTransactions.map((transaction: any) => (
                    <div 
                      key={transaction.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={transaction.type === 'income' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900" data-testid={`text-transaction-description-${transaction.id}`}>
                              {transaction.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 capitalize">
                                {transaction.type}
                              </span>
                              {transaction.category && (
                                <Badge 
                                  className={categoryColors[transaction.category] || 'bg-gray-100 text-gray-800'}
                                  data-testid={`badge-transaction-category-${transaction.id}`}
                                >
                                  {transaction.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span 
                            className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}
                            data-testid={`text-transaction-amount-${transaction.id}`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditEntry(transaction)}
                              className="text-blue-primary hover:text-blue-dark"
                              data-testid={`button-edit-${transaction.id}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-danger hover:text-red-600"
                              disabled={deleteTransactionMutation.isPending}
                              data-testid={`button-delete-${transaction.id}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t pt-6">
          <Button 
            className="w-full bg-blue-primary text-white py-3 rounded-lg hover:bg-blue-dark font-medium"
            onClick={onAddEntry}
            data-testid="button-add-new-entry"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
