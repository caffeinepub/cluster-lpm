import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../lib/auth/useAuth';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSecretParameter } from '../../utils/urlParams';

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, error: adminError } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPath = location.pathname;
  const hasAdminToken = !!getSecretParameter('caffeineAdminToken');

  console.log('[RequireAuth] Full state:', {
    isAuthenticated,
    isInitializing,
    actorFetching,
    profileFetched,
    adminFetched,
    isAdmin,
    requiredRole,
    hasProfile: !!userProfile,
    profileIsNull: userProfile === null,
    currentPath,
    hasAdminToken,
    principal: identity?.getPrincipal().toString(),
    profileError: profileError ? (profileError as Error).message : null,
    adminError: adminError ? (adminError as Error).message : null
  });

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      console.log('[RequireAuth] Not authenticated, redirecting to login');
      navigate({ to: '/' });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  // Show loading while initializing, fetching actor, or waiting for auth checks to complete
  const isLoadingAuth = isInitializing || actorFetching;
  const isLoadingData = isAuthenticated && actor && (!profileFetched || (requiredRole === 'admin' && !adminFetched));
  const isLoading = isLoadingAuth || isLoadingData;

  console.log('[RequireAuth] Loading states:', { 
    isLoadingAuth, 
    isLoadingData, 
    isLoading,
    profileLoading,
    adminLoading
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoadingAuth ? 'Initializing...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If there was an error fetching profile or admin status, show error
  if (profileError || adminError) {
    const handleLogout = async () => {
      console.log('[RequireAuth] Logging out due to error');
      await clear();
      navigate({ to: '/' });
    };

    console.error('[RequireAuth] Authentication error:', { profileError, adminError });

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Authentication Error</CardTitle>
            </div>
            <CardDescription>
              There was an error verifying your account. Please try logging in again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Error details:</p>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {(profileError as Error)?.message || (adminError as Error)?.message || 'Unknown error'}
              </code>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Logout and try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has no profile, redirect to profile setup (unless already there)
  if (userProfile === null && currentPath !== '/profile-setup') {
    console.log('[RequireAuth] No profile found, redirecting to profile setup');
    navigate({ to: '/profile-setup' });
    return null;
  }

  // If role is required, check authorization
  if (requiredRole) {
    console.log('[RequireAuth] Checking role requirement:', {
      requiredRole,
      isAdmin,
      adminFetched,
      hasProfile: !!userProfile
    });

    if (requiredRole === 'admin' && !isAdmin) {
      console.log('[RequireAuth] Admin role required but user is not admin');
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>
                You do not have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This page requires administrator privileges. You may need to be assigned a role by an administrator. Please contact support.
              </p>
              <Button onClick={() => navigate({ to: '/hotel' })} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  console.log('[RequireAuth] Authorization successful, rendering children');
  return <>{children}</>;
}
