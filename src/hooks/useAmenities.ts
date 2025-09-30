import { useQuery } from '@tanstack/react-query';
import { amenityService, type AmenityQueryParams } from '../services/api/amenities';

export const useAmenities = (params?: AmenityQueryParams) => {
  return useQuery({
    queryKey: ['amenities', params],
    queryFn: () => amenityService.getAmenities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAmenity = (amenityId: number) => {
  return useQuery({
    queryKey: ['amenity', amenityId],
    queryFn: () => amenityService.getAmenity(amenityId),
    enabled: !!amenityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAmenitiesByCategory = (category: string, params?: AmenityQueryParams) => {
  return useQuery({
    queryKey: ['amenities', 'category', category, params],
    queryFn: () => amenityService.getAmenitiesByCategory(category, params),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
