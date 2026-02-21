import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../lib/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim() || !username.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('Attempting to save profile:', { name: name.trim(), username: username.trim() });

    saveProfile(
      { name: name.trim(), username: username.trim() },
      {
        onSuccess: () => {
          console.log('Profile saved successfully');
          toast.success('Profile created successfully');
          navigate({ to: '/hotel' });
        },
        onError: (error: any) => {
          console.error('Profile save error:', error);
          
          // Extract error message from various error formats
          let errorMessage = 'Failed to create profile';
          
          if (error?.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.toString) {
            errorMessage = error.toString();
          }
          
          // Check if it's an authorization error
          if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
            errorMessage = 'Authorization error: You may need to be assigned a role by an administrator. Please contact support.';
          }
          
          console.error('Formatted error message:', errorMessage);
          setError(errorMessage);
          toast.error(errorMessage);
        },
      }
    );
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to continue</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome! Please provide your information to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
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
                disabled={isPending}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
