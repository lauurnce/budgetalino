import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface AddEditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  editingTransaction?: any;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

const categories = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'rent', label: 'Rent & Housing' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

export default function AddEditEntryModal({
  isOpen,
  onClose,
  selectedDate,
  editingTransaction,
  onSuccess,
  onError
}: AddEditEntryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setFormData({
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          description: editingTransaction.description,
          category: editingTransaction.category || '',
          date: editingTransaction.date,
        });
      } else {
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        });
      }
    }
  }, [isOpen, editingTransaction, selectedDate]);

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      onSuccess();
    },
    onError: (error: Error) => {
      onError(error);
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/transactions/${editingTransaction.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      onSuccess();
    },
    onError: (error: Error) => {
      onError(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'expense' && !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category for expenses",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount).toFixed(2),
      category: formData.type === 'income' ? null : formData.category,
    };

    if (editingTransaction) {
      updateTransactionMutation.mutate(submitData);
    } else {
      createTransactionMutation.mutate(submitData);
    }
  };

  const isSubmitting = createTransactionMutation.isPending || updateTransactionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="modal-add-edit-entry">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {editingTransaction ? 'Edit Entry' : 'Add New Entry'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.type === 'expense' ? 'default' : 'outline'}
                className={`p-3 font-medium ${formData.type === 'expense' 
                  ? 'bg-danger text-white hover:bg-red-600' 
                  : 'border-2 border-gray-200 text-gray-600 hover:bg-red-50 hover:border-danger hover:text-danger'
                }`}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                data-testid="button-type-expense"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Expense
              </Button>
              <Button
                type="button"
                variant={formData.type === 'income' ? 'default' : 'outline'}
                className={`p-3 font-medium ${formData.type === 'income' 
                  ? 'bg-success text-white hover:bg-green-600' 
                  : 'border-2 border-gray-200 text-gray-600 hover:bg-green-50 hover:border-success hover:text-success'
                }`}
                onClick={() => setFormData({ ...formData, type: 'income' })}
                data-testid="button-type-income"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Income
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">Amount</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                required
                className="pl-8"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                data-testid="input-amount"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
            <Input
              type="text"
              id="description"
              required
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-description"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">Date</Label>
            <Input
              type="date"
              id="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              data-testid="input-date"
            />
          </div>

          {/* Category (only for expenses) */}
          {formData.type === 'expense' && (
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-primary text-white hover:bg-blue-dark"
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting ? 'Saving...' : (editingTransaction ? 'Update Entry' : 'Add Entry')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
