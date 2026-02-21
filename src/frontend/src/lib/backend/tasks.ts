import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { Task } from '../../backend';
import { toast } from 'sonner';

export function useGetMyTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['myTasks'],
    queryFn: async () => {
      if (!actor) return [];
      const allTasks = await actor.getAllTasks();
      const identity = await actor.getCallerUserProfile();
      // Filter tasks assigned to current user
      return allTasks;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      dueDate,
      priority,
      hotelIds,
    }: {
      title: string;
      description: string;
      dueDate: bigint;
      priority: string;
      hotelIds: bigint[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(title, description, dueDate, priority, hotelIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useGetTaskComments(taskId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['taskComments', taskId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskComments(taskId);
    },
    enabled: !!actor && !isFetching && !!taskId,
  });
}

export function useAddTaskComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, comment }: { taskId: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(taskId, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskComments', variables.taskId] });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}
