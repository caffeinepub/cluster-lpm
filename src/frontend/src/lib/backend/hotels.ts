import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { Hotel } from '../../backend';

export function useGetAllHotels() {
  const { actor, isFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ['allHotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHotels();
    },
    enabled: !!actor && !isFetching,
  });
}
