import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateSportRequest, UpdateSportRequest } from '../../types';

export interface SportQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  [key: string]: unknown;
}

export class SportService extends BaseApiService {
  // Media upload method
  async uploadMedia(imageFile: File, title: string, mediaId?: number) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (mediaId) {
      formData.append('id', mediaId.toString());
    }
    formData.append('title', title);

    const response = await this.api.post('/admin/media/v1/media', formData, {
      headers: {
        'Content-Type': undefined, // Let browser set the correct multipart/form-data header
      },
    });
    return response.data;
  }

  // Sport management methods
  async getSports(params?: SportQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/sports/v1/sports', { params: queryParams });
    return response.data;
  }

  async getSport(sportId: number) {
    const response = await this.api.get(`/admin/sports/v1/sports/${sportId}`);
    return response.data;
  }

  async createSport(sportData: CreateSportRequest) {
    // Send JSON request with images array
    const response = await this.api.post('/admin/sports/v1/sports', sportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async updateSport(sportId: number, sportData: UpdateSportRequest) {
    // Send JSON request with images array
    const response = await this.api.patch(`/admin/sports/v1/sports/${sportId}`, sportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteSport(sportId: number) {
    const response = await this.api.delete(`/admin/sports/v1/sports/${sportId}`);
    return response.data;
  }
}

export const sportService = new SportService();

