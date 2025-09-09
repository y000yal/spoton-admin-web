import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../services/api/media';
import type { MediaQueryParams } from '../types';
import type { CreateMediaRequest, UpdateMediaRequest, PaginatedResponse, Media } from '../types';

// Query keys
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (params: MediaQueryParams) => [...mediaKeys.lists(), params] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: number) => [...mediaKeys.details(), id] as const,
};

// Hooks for media list
export const useMedia = (params: MediaQueryParams) => {
  return useQuery<PaginatedResponse<Media>>({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaService.getMedia(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single media
export const useMediaById = (mediaId: number) => {
  return useQuery<Media>({
    queryKey: mediaKeys.detail(mediaId),
    queryFn: () => mediaService.getMediaById(mediaId),
    enabled: mediaId > 0,
  });
};

// Mutation for creating media
export const useCreateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaData: CreateMediaRequest) => mediaService.createMedia(mediaData),
    onSuccess: () => {
      // Invalidate and refetch media list
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};

// Mutation for updating media
export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, mediaData }: { 
      mediaId: number; 
      mediaData: UpdateMediaRequest; 
    }) => mediaService.updateMedia(mediaId, mediaData),
    onSuccess: (_, variables) => {
      // Invalidate all media-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      
      // Also specifically invalidate the detail query
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(variables.mediaId) });
    },
  });
};

// Mutation for deleting single media
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: number) => mediaService.deleteMedia(mediaId),
    onSuccess: (_, mediaId) => {
      // Remove the media from cache
      queryClient.removeQueries({ queryKey: mediaKeys.detail(mediaId) });
      // Invalidate and refetch media list
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};

// Mutation for deleting multiple media
export const useDeleteMultipleMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaIds, userId }: { mediaIds: number[]; userId: number }) => 
      mediaService.deleteMultipleMedia(mediaIds, userId),
    onSuccess: (_, { mediaIds }) => {
      // Remove the media from cache
      mediaIds.forEach(mediaId => {
        queryClient.removeQueries({ queryKey: mediaKeys.detail(mediaId) });
      });
      // Invalidate and refetch media list
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};
