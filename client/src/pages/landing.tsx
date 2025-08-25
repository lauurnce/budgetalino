import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-primary rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Budget Tracker</CardTitle>
          <p className="text-gray-600">Take control of your personal finances with our intuitive calendar-based budgeting tool.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-primary rounded-full"></div>
              <span className="text-sm text-gray-600">Track income and expenses by date</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-primary rounded-full"></div>
              <span className="text-sm text-gray-600">Organize expenses by category</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-primary rounded-full"></div>
              <span className="text-sm text-gray-600">View monthly summaries and reports</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-blue-primary hover:bg-blue-dark text-white py-3 rounded-lg font-medium"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Sign in to access your personal budget tracker
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
