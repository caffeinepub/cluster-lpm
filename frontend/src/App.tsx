import { StrictMode } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminHotelsPage from './pages/admin/AdminHotelsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsDashboardPage from './pages/admin/AdminReportsDashboardPage';
import AdminEmergencyLogPage from './pages/admin/AdminEmergencyLogPage';
import AdminEmergencyRecipientsPage from './pages/admin/AdminEmergencyRecipientsPage';
import AdminTasksPage from './pages/admin/AdminTasksPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import HotelDashboardPage from './pages/hotel/HotelDashboardPage';
import DailyReportFormPage from './pages/hotel/DailyReportFormPage';
import MyDailyReportsPage from './pages/hotel/MyDailyReportsPage';
import EmergencyTriggerPage from './pages/hotel/EmergencyTriggerPage';
import MyTasksPage from './pages/hotel/MyTasksPage';
import RequireAuth from './components/auth/RequireAuth';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const profileSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-setup',
  component: ProfileSetupPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminDashboardPage />
    </RequireAuth>
  ),
});

const adminHotelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/hotels',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminHotelsPage />
    </RequireAuth>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminUsersPage />
    </RequireAuth>
  ),
});

const adminReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reports',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminReportsDashboardPage />
    </RequireAuth>
  ),
});

const adminEmergencyLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/emergency-log',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminEmergencyLogPage />
    </RequireAuth>
  ),
});

const adminEmergencyRecipientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/emergency-recipients',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminEmergencyRecipientsPage />
    </RequireAuth>
  ),
});

const adminTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tasks',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminTasksPage />
    </RequireAuth>
  ),
});

const adminAuditLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit-logs',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminAuditLogsPage />
    </RequireAuth>
  ),
});

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: () => (
    <RequireAuth requiredRole="admin">
      <AdminAnalyticsPage />
    </RequireAuth>
  ),
});

const hotelDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel',
  component: () => (
    <RequireAuth requiredRole="user">
      <HotelDashboardPage />
    </RequireAuth>
  ),
});

const dailyReportFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel/daily-report',
  component: () => (
    <RequireAuth requiredRole="user">
      <DailyReportFormPage />
    </RequireAuth>
  ),
});

const myDailyReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel/my-reports',
  component: () => (
    <RequireAuth requiredRole="user">
      <MyDailyReportsPage />
    </RequireAuth>
  ),
});

const emergencyTriggerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel/emergency',
  component: () => (
    <RequireAuth requiredRole="user">
      <EmergencyTriggerPage />
    </RequireAuth>
  ),
});

const myTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel/tasks',
  component: () => (
    <RequireAuth requiredRole="user">
      <MyTasksPage />
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  profileSetupRoute,
  adminDashboardRoute,
  adminHotelsRoute,
  adminUsersRoute,
  adminReportsRoute,
  adminEmergencyLogRoute,
  adminEmergencyRecipientsRoute,
  adminTasksRoute,
  adminAuditLogsRoute,
  adminAnalyticsRoute,
  hotelDashboardRoute,
  dailyReportFormRoute,
  myDailyReportsRoute,
  emergencyTriggerRoute,
  myTasksRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </StrictMode>
  );
}
