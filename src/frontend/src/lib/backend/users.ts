import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { UserProfile, UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetAllUsersProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ['allUsersProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsersProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPrincipal,
      name,
      username,
      hotelId,
      securityManager,
      contactNumber,
      password,
      role,
    }: {
      userPrincipal: Principal;
      name: string;
      username: string;
      hotelId: bigint | null;
      securityManager: string | null;
      contactNumber: string | null;
      password: string;
      role: UserRole;
    }) => {
      console.log('[useCreateUser] Mutation function called');
      console.log('[useCreateUser] Actor available:', !!actor);
      
      if (!actor) {
        console.error('[useCreateUser] Actor not available');
        throw new Error('Backend connection not available. Please refresh the page.');
      }

      console.log('[useCreateUser] Calling backend createUser with params:', {
        userPrincipal: userPrincipal.toString(),
        name,
        username,
        hotelId: hotelId?.toString() || 'null',
        securityManager: securityManager || 'null',
        contactNumber: contactNumber || 'null',
        password: '***REDACTED***',
        role,
      });

      try {
        const result = await actor.createUser(
          userPrincipal,
          name,
          username,
          hotelId,
          securityManager,
          contactNumber,
          password,
          role
        );
        console.log('[useCreateUser] Backend call successful, result:', result);
        return result;
      } catch (error: any) {
        console.error('[useCreateUser] Backend call failed with error:', error);
        console.error('[useCreateUser] Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
        });
        
        // Extract meaningful error message from backend trap
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to create users');
        } else if (errorMessage.includes('User already exists')) {
          throw new Error('A user with this principal ID already exists');
        } else if (errorMessage.includes('Hotel not found')) {
          throw new Error('The selected hotel does not exist');
        } else {
          throw new Error(errorMessage || 'Failed to create user');
        }
      }
    },
    onSuccess: () => {
      console.log('[useCreateUser] Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      console.error('[useCreateUser] Mutation error handler called:', error);
      toast.error(error.message || 'Failed to create user');
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userPrincipal,
      name,
      username,
      hotelId,
      securityManager,
      contactNumber,
      isActive,
      password,
      role,
    }: {
      userPrincipal: Principal;
      name: string;
      username: string;
      hotelId: bigint | null;
      securityManager: string | null;
      contactNumber: string | null;
      isActive: boolean;
      password: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.updateUser(
          userPrincipal,
          name,
          username,
          hotelId,
          securityManager,
          contactNumber,
          isActive,
          password,
          role
        );
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to update users');
        } else if (errorMessage.includes('User not found')) {
          throw new Error('User not found');
        } else if (errorMessage.includes('Hotel not found')) {
          throw new Error('The selected hotel does not exist');
        } else {
          throw new Error(errorMessage || 'Failed to update user');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.deleteUser(userPrincipal);
      } catch (error: any) {
        const errorMessage = error?.message || String(error);
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to delete users');
        } else if (errorMessage.includes('User not found')) {
          throw new Error('User not found');
        } else {
          throw new Error(errorMessage || 'Failed to delete user');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}
