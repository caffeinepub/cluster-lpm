import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';

// Backend daily report functionality not yet implemented
export function useGetMyDailyReports() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['myDailyReports'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not available yet
      return [];
    },
    enabled: false, // Disabled until backend implements this
  });
}

export function useGetAllDailyReports() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['allDailyReports'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not available yet
      return [];
    },
    enabled: false, // Disabled until backend implements this
  });
}

export function useSaveDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      hotelId: bigint;
      occupancy: bigint;
      vipArrivals: bigint;
      guestIncidents: bigint;
      staffIncidents: bigint;
      guestComplaints: bigint;
      guestInjuries: bigint;
      staffInjuries: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not available yet
      throw new Error('Daily report submission not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDailyReports'] });
      queryClient.invalidateQueries({ queryKey: ['allDailyReports'] });
    },
  });
}
