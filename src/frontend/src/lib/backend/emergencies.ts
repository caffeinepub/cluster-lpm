import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';

// Backend emergency functionality not yet implemented
export function useGetAllEmergencies() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allEmergencies'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not available yet
      return [];
    },
    enabled: false, // Disabled until backend implements this
  });
}

export function useSubmitEmergency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      category: string;
      severity: string;
      details: string;
      hotelId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not available yet
      throw new Error('Emergency submission not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allEmergencies'] });
    },
  });
}

export function useEmergencyRecipients() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['emergencyRecipients'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not available yet
      return [];
    },
    enabled: false, // Disabled until backend implements this
  });
}

export function useAddEmergencyRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not available yet
      throw new Error('Emergency recipient management not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRecipients'] });
    },
  });
}

export function useRemoveEmergencyRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not available yet
      throw new Error('Emergency recipient management not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyRecipients'] });
    },
  });
}
