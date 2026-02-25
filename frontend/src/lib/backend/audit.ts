import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { AuditLog } from '../../backend';

export function useGetAuditLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLogs();
    },
    enabled: !!actor && !isFetching,
  });
}
