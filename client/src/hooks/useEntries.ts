import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { entryApi } from '../services/api';
import { SearchParams } from '../types';

export const useEntries = (params?: SearchParams) => {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => entryApi.getAll(params),
  });
};

export const useInfiniteEntries = (params?: Omit<SearchParams, 'page' | 'limit'>) => {
  return useInfiniteQuery({
    queryKey: ['infinite-entries', params],
    queryFn: ({ pageParam = 1 }) =>
      entryApi.getAll({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      // If we have more pages, return the next page number
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      // Otherwise, return undefined to indicate no more pages
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useEntry = (id: string) => {
  return useQuery({
    queryKey: ['entry', id],
    queryFn: () => entryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => entryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-entries'] });
    },
  });
};

export const useUpdateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      entryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-entries'] });
      queryClient.invalidateQueries({ queryKey: ['entry'] });
    },
  });
};

export const useDeleteEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-entries'] });
    },
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => entryApi.getTags(),
  });
};
