import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { UserProfile, UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function useGetAllUsersProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, UserProfile]>>({
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
      name,
      username,
      hotelId,
      securityManager,
      contactNumber,
      password,
      role,
    }: {
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
        console.error('[useCreateUser] Error type:', typeof error);
        console.error('[useCreateUser] Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          fullError: JSON.stringify(error, null, 2),
        });
        
        // Extract meaningful error message from backend trap or rejection
        let errorMessage = '';
        
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        
        console.log('[useCreateUser] Extracted error message:', errorMessage);
        
        // Parse specific error cases
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to create users. Please ensure you are logged in as an admin.');
        } else if (errorMessage.includes('User already exists')) {
          throw new Error('A user with this username already exists in the system.');
        } else if (errorMessage.includes('Hotel not found')) {
          throw new Error('The selected hotel does not exist. Please select a valid hotel.');
        } else if (errorMessage.includes('restricted')) {
          throw new Error(errorMessage);
        } else {
          throw new Error(errorMessage || 'Failed to create user. Please try again.');
        }
      }
    },
    onSuccess: (userId) => {
      console.log('[useCreateUser] Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User created successfully', {
        description: `User ID: ${userId}`,
      });
    },
    onError: (error: Error) => {
      console.error('[useCreateUser] Mutation error handler:', error);
      toast.error('Failed to create user', {
        description: error.message,
      });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      name,
      username,
      hotelId,
      securityManager,
      contactNumber,
      isActive,
      password,
      role,
    }: {
      userId: string;
      name: string;
      username: string;
      hotelId: bigint | null;
      securityManager: string | null;
      contactNumber: string | null;
      isActive: boolean;
      password: string;
      role: UserRole;
    }) => {
      console.log('[useUpdateUser] Mutation function called for userId:', userId);
      console.log('[useUpdateUser] Actor available:', !!actor);
      
      if (!actor) {
        console.error('[useUpdateUser] Actor not available');
        throw new Error('Backend connection not available. Please refresh the page.');
      }

      console.log('[useUpdateUser] Calling backend updateUser with params:', {
        userId,
        name,
        username,
        hotelId: hotelId?.toString() || 'null',
        securityManager: securityManager || 'null',
        contactNumber: contactNumber || 'null',
        isActive,
        password: '***REDACTED***',
        role,
      });

      try {
        await actor.updateUser(
          userId,
          name,
          username,
          hotelId,
          securityManager,
          contactNumber,
          isActive,
          password,
          role
        );
        console.log('[useUpdateUser] Backend call successful');
      } catch (error: any) {
        console.error('[useUpdateUser] Backend call failed with error:', error);
        
        let errorMessage = '';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        
        console.log('[useUpdateUser] Extracted error message:', errorMessage);
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to update users. Please ensure you are logged in as an admin.');
        } else if (errorMessage.includes('User not found')) {
          throw new Error('User not found. They may have been deleted.');
        } else if (errorMessage.includes('Hotel not found')) {
          throw new Error('The selected hotel does not exist. Please select a valid hotel.');
        } else if (errorMessage.includes('restricted') || errorMessage.includes('escalation')) {
          throw new Error(errorMessage);
        } else {
          throw new Error(errorMessage || 'Failed to update user. Please try again.');
        }
      }
    },
    onSuccess: () => {
      console.log('[useUpdateUser] Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      console.error('[useUpdateUser] Mutation error handler:', error);
      toast.error('Failed to update user', {
        description: error.message,
      });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('[useDeleteUser] Mutation function called for userId:', userId);
      console.log('[useDeleteUser] Actor available:', !!actor);
      
      if (!actor) {
        console.error('[useDeleteUser] Actor not available');
        throw new Error('Backend connection not available. Please refresh the page.');
      }

      console.log('[useDeleteUser] Calling backend deleteUser');

      try {
        await actor.deleteUser(userId);
        console.log('[useDeleteUser] Backend call successful');
      } catch (error: any) {
        console.error('[useDeleteUser] Backend call failed with error:', error);
        
        let errorMessage = '';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        
        console.log('[useDeleteUser] Extracted error message:', errorMessage);
        
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to delete users. Please ensure you are logged in as an admin.');
        } else if (errorMessage.includes('User not found')) {
          throw new Error('User not found. They may have already been deleted.');
        } else if (errorMessage.includes('Cannot delete your own account')) {
          throw new Error('You cannot delete your own account.');
        } else {
          throw new Error(errorMessage || 'Failed to delete user. Please try again.');
        }
      }
    },
    onSuccess: () => {
      console.log('[useDeleteUser] Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      console.error('[useDeleteUser] Mutation error handler:', error);
      toast.error('Failed to delete user', {
        description: error.message,
      });
    },
  });
}
