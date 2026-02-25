import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../lib/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  CheckSquare,
  ClipboardList,
} from 'lucide-react';

export default function HotelDashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();

  const quickActions = [
    {
      title: 'Submit Daily Report',
      description: 'Record today\'s operational metrics',
      icon: FileText,
      path: '/hotel/daily-report',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'My Reports',
      description: 'View submitted reports',
      icon: ClipboardList,
      path: '/hotel/my-reports',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Emergency Alert',
      description: 'Report urgent situations',
      icon: AlertTriangle,
      path: '/hotel/emergency',
      color: 'from-red-500 to-orange-600',
    },
    {
      title: 'My Tasks',
      description: 'View and update assigned tasks',
      icon: CheckSquare,
      path: '/hotel/tasks',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userProfile?.name || 'User'}</h1>
          <p className="text-muted-foreground">Hotel Operations Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate({ to: action.path })}
            >
              <CardHeader>
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center shadow-md mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Open
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
