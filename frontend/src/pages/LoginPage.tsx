import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../lib/auth/useAuth';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Hotel, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSecretParameter } from '../utils/urlParams';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading, isFetched: adminFetched, error: adminError } = useIsCallerAdmin();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const isLoginError = loginStatus === 'loginError';
  const actorReady = !!actor && !actorFetching;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // Redirect effect: once authenticated and data is ready, navigate to the right page
  useEffect(() => {
    if (!isAuthenticated || !actorReady) return;
    if (!profileFetched) return;

    if (userProfile === null) {
      navigate({ to: '/profile-setup' });
      return;
    }

    if (!adminFetched) return;

    const redirectPath = isAdmin ? '/admin' : '/hotel';
    navigate({ to: redirectPath });
  }, [isAuthenticated, actorReady, profileFetched, adminFetched, userProfile, isAdmin, navigate]);

  // Clear login error when status changes away from error
  useEffect(() => {
    if (loginStatus !== 'loginError') {
      setLoginError(null);
    }
  }, [loginStatus]);

  const handleLogin = async () => {
    setLoginError(null);
    setIsRetrying(false);

    try {
      await login();
    } catch (error: any) {
      const message = error?.message ?? String(error);

      // If already authenticated, clear session and retry
      if (message === 'User is already authenticated') {
        setIsRetrying(true);
        try {
          await clear();
          queryClient.clear();
          // Small delay to let state settle
          retryTimeoutRef.current = setTimeout(async () => {
            setIsRetrying(false);
            try {
              await login();
            } catch (retryError: any) {
              setLoginError('Login failed. Please try again.');
            }
          }, 300);
        } catch (clearError: any) {
          setIsRetrying(false);
          setLoginError('Failed to reset session. Please refresh the page.');
        }
        return;
      }

      // User closed the popup or cancelled
      if (message?.includes('UserInterrupt') || message?.includes('closed') || message?.includes('cancel')) {
        // Don't show error for user-initiated cancellation
        return;
      }

      setLoginError(message || 'Login failed. Please try again.');
    }
  };

  // Handle loginError status from the hook itself (e.g. "User is already authenticated")
  useEffect(() => {
    if (isLoginError && !isRetrying) {
      // The hook set an error state — handle "already authenticated" case
      // by clearing and retrying automatically
      const handleAlreadyAuthenticated = async () => {
        setIsRetrying(true);
        try {
          await clear();
          queryClient.clear();
          retryTimeoutRef.current = setTimeout(async () => {
            setIsRetrying(false);
            try {
              await login();
            } catch {
              setLoginError('Login failed. Please try again.');
            }
          }, 300);
        } catch {
          setIsRetrying(false);
          setLoginError('Failed to reset session. Please refresh the page.');
        }
      };

      // Only auto-retry if we're not already showing a user-visible error
      if (!loginError) {
        handleAlreadyAuthenticated();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginError]);

  const isWaitingForData =
    isAuthenticated &&
    actorReady &&
    profileFetched &&
    userProfile !== null &&
    !adminFetched;

  const isProcessing =
    isInitializing ||
    isLoggingIn ||
    isRetrying ||
    (isAuthenticated && !actorReady) ||
    (isAuthenticated && actorReady && !profileFetched) ||
    isWaitingForData;

  const getButtonLabel = () => {
    if (isInitializing) return 'Initializing...';
    if (isLoggingIn) return 'Connecting...';
    if (isRetrying) return 'Retrying...';
    if (isAuthenticated && !actorReady) return 'Loading...';
    if (isAuthenticated && actorReady && !profileFetched) return 'Loading profile...';
    if (isWaitingForData) return 'Checking access...';
    return 'Login with Internet Identity';
  };

  const handleRetry = () => {
    setLoginError(null);
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Hotel className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Hotel Management</CardTitle>
          <CardDescription className="text-base">
            Secure login with Internet Identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          {(profileError || adminError) && isAuthenticated && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load your profile. Please try logging in again.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={loginError ? handleRetry : handleLogin}
            disabled={isProcessing}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {getButtonLabel()}
              </>
            ) : loginError ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By logging in, you agree to our terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
