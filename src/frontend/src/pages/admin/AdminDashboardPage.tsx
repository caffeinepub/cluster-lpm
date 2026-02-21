import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  CheckSquare,
  Users,
  Building2,
  BarChart3,
  ClipboardList,
  Phone,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'View Analytics',
      description: 'Operational metrics and insights',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Daily Reports',
      description: 'View and export reports',
      icon: FileText,
      path: '/admin/reports',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Emergency Log',
      description: 'View emergency alerts',
      icon: AlertTriangle,
      path: '/admin/emergency-log',
      color: 'from-red-500 to-orange-600',
    },
    {
      title: 'Manage Tasks',
      description: 'Create and assign tasks',
      icon: CheckSquare,
      path: '/admin/tasks',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Manage Hotels',
      description: 'Hotel configuration',
      icon: Building2,
      path: '/admin/hotels',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Manage Users',
      description: 'User accounts and roles',
      icon: Users,
      path: '/admin/users',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      title: 'Emergency Recipients',
      description: 'SMS notification contacts',
      icon: Phone,
      path: '/admin/emergency-recipients',
      color: 'from-orange-500 to-red-600',
    },
    {
      title: 'Audit Logs',
      description: 'System activity tracking',
      icon: ClipboardList,
      path: '/admin/audit-logs',
      color: 'from-gray-500 to-slate-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Manage your hotel cluster operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
