import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { UserProfile } from '../../backend';
import { UserRole } from '../../backend';
import { getSecretParameter } from '../../utils/urlParams';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const actorReady = !!actor && !actorFetching;

  console.log('[useAuth:getProfile] State:', {
    hasActor: !!actor,
    actorFetching,
    isAuthenticated,
    actorReady,
    principal: identity?.getPrincipal().toString()
  });

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useAuth:getProfile] Actor not available for profile fetch');
        throw new Error('Actor not available');
      }
      console.log('[useAuth:getProfile] Fetching caller user profile...');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('[useAuth:getProfile] User profile fetched successfully:', {
          hasProfile: !!profile,
          username: profile?.username,
          role: profile?.role
        });
        return profile;
      } catch (error: any) {
        console.error('[useAuth:getProfile] Error fetching user profile:', {
          error,
          message: error?.message,
          stack: error?.stack
        });
        // If the error is about authorization, return null instead of throwing
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          console.log('[useAuth:getProfile] User not authorized or no profile exists, returning null');
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && isAuthenticated && actorReady,
    retry: 1,
    retryDelay: 500,
    staleTime: 5000,
  });

  console.log('[useAuth:getProfile] Query state:', {
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    hasData: !!query.data,
    hasError: !!query.error
  });

  return {
    ...query,
    isLoading: (!actorReady && isAuthenticated) || query.isLoading,
    isFetched: !!actor && isAuthenticated && actorReady && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; username: string }) => {
      console.log('[useAuth:saveProfile] Starting profile save mutation');
      
      if (!actor) {
        console.error('[useAuth:saveProfile] Actor not available for profile save');
        throw new Error('Actor not available');
      }

      const actorReady = !!actor && !actorFetching;
      console.log('[useAuth:saveProfile] Actor ready:', actorReady);
      
      if (!actorReady) {
        console.error('[useAuth:saveProfile] Actor not ready for profile save');
        throw new Error('System is still initializing. Please wait a moment and try again.');
      }

      // Check if this is a bootstrap admin scenario
      const hasAdminToken = !!getSecretParameter('caffeineAdminToken');
      console.log('[useAuth:saveProfile] Bootstrap admin scenario:', hasAdminToken);
      
      const fullProfile: UserProfile = {
        name: profile.name,
        username: profile.username,
        hotelId: undefined,
        isActive: true,
        password: '',
        role: hasAdminToken ? UserRole.admin : UserRole.user,
      };
      
      console.log('[useAuth:saveProfile] Calling backend saveCallerUserProfile with:', {
        name: fullProfile.name,
        username: fullProfile.username,
        role: fullProfile.role,
        hasAdminToken
      });
      
      try {
        await actor.saveCallerUserProfile(fullProfile);
        console.log('[useAuth:saveProfile] Backend call successful');
      } catch (error: any) {
        console.error('[useAuth:saveProfile] Backend call failed:', {
          error,
          message: error?.message,
          stack: error?.stack,
          type: typeof error
        });
        
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
      console.log('[useAuth:saveProfile] Profile mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
    onError: (error: any) => {
      console.error('[useAuth:saveProfile] Profile mutation error:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const actorReady = !!actor && !actorFetching;

  console.log('[useAuth:isAdmin] State:', {
    hasActor: !!actor,
    actorFetching,
    isAuthenticated,
    actorReady
  });

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useAuth:isAdmin] Actor not available for admin check');
        return false;
      }
      console.log('[useAuth:isAdmin] Checking if caller is admin...');
      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log('[useAuth:isAdmin] Admin check result:', isAdmin);
        return isAdmin;
      } catch (error: any) {
        console.error('[useAuth:isAdmin] Error checking admin status:', {
          error,
          message: error?.message,
          stack: error?.stack
        });
        // If there's an authorization error, the user is not an admin
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          console.log('[useAuth:isAdmin] Authorization error, user is not admin');
          return false;
        }
        // For other errors, also return false to be safe
        console.log('[useAuth:isAdmin] Unknown error, defaulting to non-admin');
        return false;
      }
    },
    enabled: !!actor && isAuthenticated && actorReady,
    retry: 1,
    retryDelay: 500,
    staleTime: 5000,
  });
}
