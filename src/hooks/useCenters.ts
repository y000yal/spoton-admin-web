import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centerService, type CenterQueryParams } from '../services/api/centers';
import type { CreateCenterRequest, UpdateCenterRequest, PaginatedResponse, Center } from '../types';

// Query keys
export const centersKeys = {
  all: ['centers'] as const,
  lists: () => [...centersKeys.all, 'list'] as const,
  list: (params: CenterQueryParams) => [...centersKeys.lists(), params] as const,
  details: () => [...centersKeys.all, 'detail'] as const,
  detail: (id: number) => [...centersKeys.details(), id] as const,
};

// Hooks for centers list
export const useCenters = (params: CenterQueryParams) => {
  return useQuery<PaginatedResponse<Center>>({
    queryKey: centersKeys.list(params),
    queryFn: () => centerService.getCenters(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single center
export const useCenter = (centerId: number) => {
  return useQuery<Center>({
    queryKey: centersKeys.detail(centerId),
    queryFn: () => centerService.getCenter(centerId),
    enabled: centerId > 0,
  });
};

// Mutation for creating center
export const useCreateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (centerData: CreateCenterRequest) => centerService.createCenter(centerData),
    onSuccess: () => {
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: centersKeys.lists() });
    },
  });
};

// Mutation for updating center
export const useUpdateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ centerId, centerData }: { 
      centerId: number; 
      centerData: UpdateCenterRequest; 
    }) => centerService.updateCenter(centerId, centerData),
    onSuccess: (data, variables) => {
      // Invalidate all center-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: centersKeys.all });
      
      // Also specifically invalidate the detail query
      queryClient.invalidateQueries({ queryKey: centersKeys.detail(variables.centerId) });
    },
  });
};

// Mutation for deleting center
export const useDeleteCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (centerId: number) => centerService.deleteCenter(centerId),
    onSuccess: (_, centerId) => {
      // Remove the center from cache
      queryClient.removeQueries({ queryKey: centersKeys.detail(centerId) });
      // Invalidate and refetch centers list
      queryClient.invalidateQueries({ queryKey: centersKeys.lists() });
    },
  });
};
