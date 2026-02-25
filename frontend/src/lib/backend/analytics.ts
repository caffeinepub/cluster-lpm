import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';

// Backend analytics functionality not yet implemented
export function useGetAnalyticsSummary(startTime: bigint, endTime: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['analyticsSummary', startTime.toString(), endTime.toString()],
    queryFn: async () => {
      if (!actor) return null;
      // Backend method not available yet
      return null;
    },
    enabled: false, // Disabled until backend implements this
  });
}
