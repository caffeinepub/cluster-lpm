import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../lib/auth/useAuth';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const navigate = useNavigate();
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, error: adminError } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate({ to: '/' });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  // Show loading while initializing, fetching actor, or waiting for auth checks to complete
  const isLoadingAuth = isInitializing || actorFetching;
  const isLoadingData = isAuthenticated && actor && (!profileFetched || !adminFetched);
  const isLoading = isLoadingAuth || isLoadingData;

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
      await clear();
      navigate({ to: '/' });
    };

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

  // Check if user profile exists and is active
  if (userProfile && !userProfile.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Account Deactivated</CardTitle>
            </div>
            <CardDescription>
              Your account has been deactivated. Please contact an administrator for assistance.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check admin role requirement
  if (requiredRole === 'admin' && isAdmin === false) {
    const handleLogout = async () => {
      await clear();
      navigate({ to: '/' });
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You do not have permission to access this page. Administrator privileges are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Your principal ID:</p>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {identity?.getPrincipal().toString()}
              </code>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Logout and try different account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
