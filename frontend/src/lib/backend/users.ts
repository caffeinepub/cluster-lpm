import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { UserProfile, UserRole } from '../../backend';
import { toast } from 'sonner';

export function useGetAllUsersProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, UserProfile]>>({
    queryKey: ['allUsersProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllUsersProfiles();
      // Convert Principal to string for frontend use
      return result.map(([principal, profile]) => [principal.toString(), profile]);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUser() {
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
      isActive = true,
      password,
      role,
    }: {
      userId: string;
      name: string;
      username: string;
      hotelId: bigint | null;
      securityManager: string | null;
      contactNumber: string | null;
      isActive?: boolean;
      password: string;
      role: UserRole;
    }) => {
      if (!actor) throw new Error('Actor not available');

      await actor.createUser(
        userId,
        name.trim(),
        username.trim(),
        hotelId,
        securityManager,
        contactNumber,
        isActive,
        password,
        role,
      );
    },
    onSuccess: () => {
      // Only invalidate the users list — do NOT invalidate auth-related queries
      // to avoid disrupting the current admin session
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create user';
      if (message.includes('Username already exists')) {
        toast.error('Username already exists. Please choose a different username.');
      } else {
        toast.error(message);
      }
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
      if (!actor) throw new Error('Actor not available');

      await actor.updateUser(
        userId,
        name.trim(),
        username.trim(),
        hotelId,
        securityManager,
        contactNumber,
        isActive,
        password,
        role,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update user';
      toast.error(message);
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsersProfiles'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete user';
      toast.error(message);
    },
  });
}
