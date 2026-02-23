import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { UserProfile } from '../../backend';
import { UserRole } from '../../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        console.log('Actor not available for profile fetch');
        throw new Error('Actor not available');
      }
      console.log('Fetching caller user profile...');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('User profile fetched:', profile);
        return profile;
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        // If the error is about authorization, return null instead of throwing
        if (error?.message?.includes('Unauthorized')) {
          console.log('User not authorized, returning null profile');
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && isAuthenticated && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000,
  });

  return {
    ...query,
    isLoading: (actorFetching && isAuthenticated) || query.isLoading,
    isFetched: !!actor && isAuthenticated && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; username: string }) => {
      if (!actor) {
        console.error('Actor not available for profile save');
        throw new Error('Actor not available');
      }
      
      const fullProfile: UserProfile = {
        name: profile.name,
        username: profile.username,
        hotelId: undefined,
        isActive: true,
        password: '',
        role: UserRole.user,
      };
      
      console.log('Calling backend saveCallerUserProfile with:', fullProfile);
      
      try {
        await actor.saveCallerUserProfile(fullProfile);
        console.log('Backend call successful');
      } catch (error: any) {
        console.error('Backend call failed:', error);
        
        // Extract and re-throw error with proper message
        if (error?.message) {
          throw new Error(error.message);
        } else if (typeof error === 'string') {
          throw new Error(error);
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      console.log('Profile mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      console.error('Profile mutation error:', error);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) {
        console.log('Actor not available for admin check');
        return false;
      }
      console.log('Checking if caller is admin...');
      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log('Admin check result:', isAdmin);
        return isAdmin;
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        // If there's an authorization error, the user is not an admin
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          console.log('Authorization error, user is not admin');
          return false;
        }
        throw error;
      }
    },
    enabled: !!actor && isAuthenticated && !actorFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5000, // Cache for 5 seconds to avoid excessive calls
  });
}
