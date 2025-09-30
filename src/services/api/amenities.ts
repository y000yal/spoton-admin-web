import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AmenityQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  category?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export class AmenityService extends BaseApiService {
  // Get all amenities
  async getAmenities(params?: AmenityQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/amenities/v1/amenities', { params: queryParams });
    return response.data;
  }

  // Get amenity by ID
  async getAmenity(amenityId: number) {
    const response = await this.api.get(`/admin/amenities/v1/amenities/${amenityId}`);
    return response.data;
  }

  // Get amenities by category
  async getAmenitiesByCategory(category: string, params?: AmenityQueryParams) {
    const queryParams = buildQueryParams({ ...params, category });
    const response = await this.api.get('/admin/amenities/v1/amenities', { params: queryParams });
    return response.data;
  }
}

export const amenityService = new AmenityService();
