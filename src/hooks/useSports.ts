import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sportService, type SportQueryParams } from '../services/api/sports';
import type { CreateSportRequest, UpdateSportRequest, PaginatedResponse, Sport } from '../types';

// Query keys
export const sportsKeys = {
  all: ['sports'] as const,
  lists: () => [...sportsKeys.all, 'list'] as const,
  list: (params: SportQueryParams) => [...sportsKeys.lists(), params] as const,
  details: () => [...sportsKeys.all, 'detail'] as const,
  detail: (id: number) => [...sportsKeys.details(), id] as const,
};

// Hooks for sports list
export const useSports = (params: SportQueryParams) => {
  return useQuery<PaginatedResponse<Sport>>({
    queryKey: sportsKeys.list(params),
    queryFn: () => sportService.getSports(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single sport
export const useSport = (sportId: number) => {
  return useQuery<Sport>({
    queryKey: sportsKeys.detail(sportId),
    queryFn: () => sportService.getSport(sportId),
    enabled: sportId > 0,
  });
};

// Mutation for creating sport
export const useCreateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sportData: CreateSportRequest) => sportService.createSport(sportData),
    onSuccess: () => {
      // Invalidate and refetch sports list
      queryClient.invalidateQueries({ queryKey: sportsKeys.lists() });
    },
  });
};

// Mutation for updating sport
export const useUpdateSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sportId, sportData }: { 
      sportId: number; 
      sportData: UpdateSportRequest; 
    }) => sportService.updateSport(sportId, sportData),
    onSuccess: (_, variables) => {
      // Invalidate all sport-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: sportsKeys.all });
      
      // Also specifically invalidate the detail query
      queryClient.invalidateQueries({ queryKey: sportsKeys.detail(variables.sportId) });
    },
  });
};

// Mutation for deleting sport
export const useDeleteSport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sportId: number) => sportService.deleteSport(sportId),
    onSuccess: (_, sportId) => {
      // Remove the sport from cache
      queryClient.removeQueries({ queryKey: sportsKeys.detail(sportId) });
      // Invalidate and refetch sports list
      queryClient.invalidateQueries({ queryKey: sportsKeys.lists() });
    },
  });
};
