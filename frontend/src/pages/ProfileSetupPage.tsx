import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile, useIsCallerAdmin, useGetCallerUserProfile } from '../lib/auth/useAuth';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSecretParameter } from '../utils/urlParams';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const saveProfile = useSaveCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  // Check if user already has a profile — if so, redirect to their dashboard
  const { data: existingProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const actorReady = !!actor && !actorFetching;
  const hasAdminToken = !!getSecretParameter('caffeineAdminToken');

  // If the user already has a profile, redirect them to the appropriate dashboard
  useEffect(() => {
    if (!actorReady || !profileFetched) return;

    if (existingProfile !== null && existingProfile !== undefined) {
      // User already has a profile — determine where to send them
      const redirectPath = isAdmin ? '/admin' : '/hotel';
      navigate({ to: redirectPath });
    }
  }, [actorReady, profileFetched, existingProfile, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actorReady) return;

    try {
      await saveProfile.mutateAsync({ name, username });

      // Redirect based on role
      const redirectPath = isAdmin ? '/admin' : '/hotel';
      navigate({ to: redirectPath });
    } catch (error: any) {
      // Error displayed in the form
    }
  };

  if (!isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  // Show loading while checking for existing profile
  if (!actorReady || (actorReady && !profileFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking your account...</p>
        </div>
      </div>
    );
  }

  // If profile exists, we're redirecting — show nothing while that happens
  if (existingProfile !== null && existingProfile !== undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            {hasAdminToken
              ? 'Set up your administrator profile to get started'
              : 'Set up your profile to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saveProfile.isPending || !actorReady}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={saveProfile.isPending || !actorReady}
              />
            </div>

            {saveProfile.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(saveProfile.error as Error).message}
                </AlertDescription>
              </Alert>
            )}

            {!actorReady && (
              <Alert>
                <AlertDescription>
                  Initializing system... Please wait.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending || !actorReady || !name || !username}
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
