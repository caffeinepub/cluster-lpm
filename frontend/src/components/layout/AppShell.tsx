import { ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../lib/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Hotel,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  CheckSquare,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  Shield,
  LogOut,
  User,
  Menu,
  Phone,
} from 'lucide-react';
import { SiX, SiFacebook, SiLinkedin, SiInstagram } from 'react-icons/si';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    try {
      // Clear Internet Identity session
      await clear();
      
      // Clear all cached queries
      queryClient.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Navigate to login page (root route)
      navigate({ to: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/emergency-log', label: 'Emergencies', icon: AlertTriangle },
    { path: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/admin/hotels', label: 'Hotels', icon: Building2 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/emergency-recipients', label: 'Recipients', icon: Phone },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  ];

  const hotelNavItems = [
    { path: '/hotel', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hotel/daily-report', label: 'Submit Report', icon: FileText },
    { path: '/hotel/my-reports', label: 'My Reports', icon: ClipboardList },
    { path: '/hotel/emergency', label: 'Emergency Alert', icon: AlertTriangle },
    { path: '/hotel/tasks', label: 'My Tasks', icon: CheckSquare },
  ];

  const navItems = isAdmin ? adminNavItems : hotelNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Hotel Cluster
              </h1>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Admin Portal' : 'Hotel Operations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? 'Administrator' : 'Hotel Staff'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        {isAuthenticated && (
          <aside className="w-64 border-r border-amber-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate({ to: item.path as any })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Hotel Cluster Management</span>
              <span>•</span>
              <span>
                Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.hostname : 'hotel-cluster'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  caffeine.ai
                </a>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <SiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <SiLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <SiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
