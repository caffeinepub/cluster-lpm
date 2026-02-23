import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hotel, Shield, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { DelegationIdentity, isDelegationValid } from '@icp-sdk/core/identity';

type LoginStage = 'idle' | 'connecting' | 'authenticating' | 'processing';

const LOGIN_TIMEOUT_MS = 45000; // 45 seconds

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginStatus, loginError: iiLoginError, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [loginStage, setLoginStage] = useState<LoginStage>('idle');
  const [timeoutError, setTimeoutError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirected = useRef(false);

  // Calculate hasValidSession locally
  const hasValidSession = useMemo(() => {
    if (!identity) return false;
    if (identity.getPrincipal().isAnonymous()) return false;
    if (!(identity instanceof DelegationIdentity)) return false;
    return isDelegationValid(identity.getDelegation());
  }, [identity]);

  const isAuthenticated = hasValidSession;
  const isLoggingIn = loginStatus === 'logging-in';
  const isError = loginStatus === 'loginError' || timeoutError !== null;
  const displayError = timeoutError || iiLoginError?.message;

  // Clear timeout when login completes or fails
  useEffect(() => {
    if (loginStatus === 'success' || loginStatus === 'loginError') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (loginStatus === 'loginError') {
        setLoginStage('idle');
      }
    }
  }, [loginStatus]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Redirect to admin after authentication and actor is ready
  useEffect(() => {
    if (isAuthenticated && actor && !actorFetching && !isInitializing && !hasRedirected.current) {
      console.log('User authenticated and actor ready, redirecting to /admin');
      hasRedirected.current = true;
      // Small delay to ensure state is settled
      setTimeout(() => {
        navigate({ to: '/admin' });
      }, 100);
    }
  }, [isAuthenticated, actor, actorFetching, isInitializing, navigate]);

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      setTimeoutError(null);
      hasRedirected.current = false;
      
      // Set initial stage
      setLoginStage('connecting');

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        setTimeoutError('Authentication timed out. Please try again.');
        setLoginStage('idle');
        timeoutRef.current = null;
      }, LOGIN_TIMEOUT_MS);

      // Update stage to authenticating after brief delay
      setTimeout(() => {
        if (loginStage === 'connecting' || isLoggingIn) {
          setLoginStage('authenticating');
        }
      }, 500);

      await login();
      
      // Update stage to processing after login completes
      if (loginStatus === 'success') {
        setLoginStage('processing');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoginStage('idle');
    }
  };

  const getStatusText = () => {
    if (!isLoggingIn && !actorFetching) return '';
    
    if (actorFetching) {
      return 'Setting up your session...';
    }
    
    switch (loginStage) {
      case 'connecting':
        return 'Connecting to Internet Identity...';
      case 'authenticating':
        return 'Waiting for authentication...';
      case 'processing':
        return 'Processing login...';
      default:
        return 'Connecting...';
    }
  };

  const getErrorIcon = () => {
    if (displayError?.includes('timeout') || displayError?.includes('timed out')) {
      return <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
    }
    return <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
  };

  const getErrorMessage = () => {
    if (timeoutError) return timeoutError;
    if (iiLoginError?.message) {
      const msg = iiLoginError.message;
      // Categorize error types for better user feedback
      if (msg.toLowerCase().includes('user interrupt') || msg.toLowerCase().includes('cancelled')) {
        return 'Authentication was cancelled. Please try again.';
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        return 'Network error. Please check your connection and try again.';
      } else if (msg.toLowerCase().includes('already authenticated')) {
        return 'Session conflict detected. Please try again.';
      }
      return msg;
    }
    return 'An error occurred during login. Please try again.';
  };

  const showLoading = (isLoggingIn || actorFetching) && !isError;
  const canLogin = !isLoggingIn && !actorFetching && !isInitializing;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Hotel className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            Hotel Cluster Management
          </CardTitle>
          <CardDescription className="text-base">
            Streamline operations across your hotel network with comprehensive reporting, emergency management, and task coordination.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Secure Authentication:</strong> Login with Internet Identity for enterprise-grade security
              </div>
            </div>
          </div>

          {isError && displayError && (
            <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
              <div className="flex items-start gap-3">
                {getErrorIcon()}
                <div className="flex-1">
                  <AlertDescription className="text-sm">
                    {getErrorMessage()}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {showLoading && (
            <div className="flex items-center justify-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg animate-in fade-in-50 duration-300">
              <Loader2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {getStatusText()}
              </span>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!canLogin}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {showLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>Secure, decentralized authentication powered by the Internet Computer</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
