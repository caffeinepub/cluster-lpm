import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import type { Hotel } from '@/backend';
import { toast } from 'sonner';

export function useGetAllHotels() {
  const { actor, isFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHotels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hotelId, name, isActive }: { hotelId: bigint; name: string; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHotel(hotelId, name, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update hotel');
    },
  });
}

export function useDeleteHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHotel(hotelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete hotel');
    },
  });
}

export function useCreateHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get current hotels to determine next ID
      const hotels = await actor.getAllHotels();
      const maxId = hotels.reduce((max, hotel) => {
        const id = Number(hotel.id);
        return id > max ? id : max;
      }, 0);
      
      const newId = BigInt(maxId + 1);
      
      return actor.createManualHotel(newId, name, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      toast.success('Hotel created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create hotel');
    },
  });
}
