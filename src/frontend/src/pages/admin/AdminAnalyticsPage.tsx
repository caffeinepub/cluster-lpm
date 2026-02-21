import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, AlertCircle, FileText, AlertTriangle, CheckSquare, Clock } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Operational metrics and insights (Last 30 days)</p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Analytics functionality is not yet implemented in the backend. This feature will be available soon.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">-</div>
            <p className="text-xs text-muted-foreground">Daily operational reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emergencies</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">-</div>
            <p className="text-xs text-muted-foreground">Emergency alerts triggered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">-</div>
            <p className="text-xs text-muted-foreground">Tasks past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">-</div>
            <p className="text-xs text-muted-foreground">Total tasks in system</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergencies by Category</CardTitle>
            <CardDescription>Distribution of emergency types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergencies by Severity</CardTitle>
            <CardDescription>Severity level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Task completion tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
