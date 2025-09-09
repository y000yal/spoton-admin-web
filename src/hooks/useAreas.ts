import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService, type AreaQueryParams } from '../services/api/areas';
import type { CreateAreaRequest, UpdateAreaRequest, PaginatedResponse, Area } from '../types';

// Query keys
export const areasKeys = {
  all: ['areas'] as const,
  lists: () => [...areasKeys.all, 'list'] as const,
  list: (params: AreaQueryParams) => [...areasKeys.lists(), params] as const,
  details: () => [...areasKeys.all, 'detail'] as const,
  detail: (centerId: number, areaId: number) => [...areasKeys.details(), centerId, areaId] as const,
  byCenter: (centerId: number) => [...areasKeys.all, 'center', centerId] as const,
};

// Hooks for areas list
export const useAreas = (params: AreaQueryParams) => {
  return useQuery<PaginatedResponse<Area>>({
    queryKey: areasKeys.list(params),
    queryFn: () => areaService.getAreas(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single area
export const useArea = (centerId: number, areaId: number) => {
  return useQuery<Area>({
    queryKey: areasKeys.detail(centerId, areaId),
    queryFn: () => areaService.getArea(centerId, areaId),
    enabled: centerId > 0 && areaId > 0,
  });
};

// Hook for areas by center
export const useAreasByCenter = (centerId: number, params?: Omit<AreaQueryParams, 'center_id'>) => {
  return useQuery<PaginatedResponse<Area>>({
    queryKey: areasKeys.byCenter(centerId),
    queryFn: () => areaService.getAreasByCenter(centerId, params),
    enabled: centerId > 0,
    placeholderData: (previousData) => previousData,
  });
};

// Mutation for creating area
export const useCreateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ centerId, areaData }: { 
      centerId: number; 
      areaData: CreateAreaRequest; 
    }) => areaService.createArea(centerId, areaData),
    onSuccess: (data, variables) => {
      // Invalidate all area-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: areasKeys.all });
      
      // Also specifically invalidate the center's areas
      queryClient.invalidateQueries({ queryKey: areasKeys.byCenter(variables.centerId) });
    },
  });
};

// Mutation for updating area
export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ centerId, areaId, areaData }: { 
      centerId: number; 
      areaId: number; 
      areaData: UpdateAreaRequest; 
    }) => areaService.updateArea(centerId, areaId, areaData),
    onSuccess: (data, variables) => {
      // Invalidate all area-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: areasKeys.all });
      
      // Also specifically invalidate the detail query and center's areas
      queryClient.invalidateQueries({ queryKey: areasKeys.detail(variables.centerId, variables.areaId) });
      queryClient.invalidateQueries({ queryKey: areasKeys.byCenter(variables.centerId) });
    },
  });
};

// Mutation for deleting area
export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ centerId, areaId }: { centerId: number; areaId: number }) => 
      areaService.deleteArea(centerId, areaId),
    onSuccess: (_, variables) => {
      // Remove the area from cache
      queryClient.removeQueries({ queryKey: areasKeys.detail(variables.centerId, variables.areaId) });
      // Invalidate and refetch areas list and center's areas
      queryClient.invalidateQueries({ queryKey: areasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: areasKeys.byCenter(variables.centerId) });
    },
  });
};
