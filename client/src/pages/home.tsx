import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import CalendarComponent from "@/components/calendar";
import MonthlySummary from "@/components/monthly-summary";
import DailyEntriesModal from "@/components/daily-entries-modal";
import AddEditEntryModal from "@/components/add-edit-entry-modal";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDailyModal(true);
  };

  const handleAddEntry = () => {
    setEditingTransaction(null);
    setShowAddEditModal(true);
  };

  const handleEditEntry = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowAddEditModal(true);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getUserInitials = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user?.email || 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900" data-testid="text-app-title">Budget Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-primary"
                data-testid="button-add-entry"
                onClick={handleAddEntry}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-light rounded-full flex items-center justify-center">
                  <span className="text-blue-primary font-medium text-sm" data-testid="text-user-initials">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm text-gray-600" data-testid="text-user-name">{getUserName()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Monthly Summary */}
        <MonthlySummary 
          currentDate={currentDate}
          onError={(error) => {
            if (isUnauthorizedError(error)) {
              toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
              });
              setTimeout(() => {
                window.location.href = "/api/login";
              }, 500);
            } else {
              toast({
                title: "Error",
                description: "Failed to load monthly summary",
                variant: "destructive",
              });
            }
          }}
        />

        {/* Calendar */}
        <CalendarComponent 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDateClick={handleDateClick}
          onAddEntry={handleAddEntry}
          onError={(error) => {
            if (isUnauthorizedError(error)) {
              toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
              });
              setTimeout(() => {
                window.location.href = "/api/login";
              }, 500);
            } else {
              toast({
                title: "Error",
                description: "Failed to load calendar data",
                variant: "destructive",
              });
            }
          }}
        />
      </div>

      {/* Daily Entries Modal */}
      <DailyEntriesModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        selectedDate={selectedDate}
        onAddEntry={handleAddEntry}
        onEditEntry={handleEditEntry}
        onError={(error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        }}
      />

      {/* Add/Edit Entry Modal */}
      <AddEditEntryModal
        isOpen={showAddEditModal}
        onClose={() => {
          setShowAddEditModal(false);
          setEditingTransaction(null);
        }}
        selectedDate={selectedDate}
        editingTransaction={editingTransaction}
        onSuccess={() => {
          setShowAddEditModal(false);
          setEditingTransaction(null);
          // Refresh data by triggering re-render
          setCurrentDate(new Date(currentDate));
        }}
        onError={(error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        }}
      />

      {/* Mobile FAB */}
      <Button
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-primary hover:bg-blue-dark text-white rounded-full shadow-lg z-40"
        onClick={handleAddEntry}
        data-testid="button-fab-add"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </Button>
    </div>
  );
}
