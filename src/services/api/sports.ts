import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateSportRequest, UpdateSportRequest } from '../../types';

export interface SportQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
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
    let mediaId: number | undefined;

    // Upload image first if provided
    if (sportData.sport_image && sportData.sport_image instanceof File) {
      try {
        const mediaResponse = await this.uploadMedia(sportData.sport_image, sportData.name);
        mediaId = mediaResponse.id || mediaResponse.media_id;
      } catch (error) {
        console.error('Failed to upload image:', error);
        throw new Error('Failed to upload image. Please try again.');
      }
    }

    // Create sport with media_id
    const requestData: any = {
      name: sportData.name,
      status: sportData.status,
      description: sportData.description || '',
    };

    if (mediaId) {
      requestData.media_id = mediaId;
    }

    const response = await this.api.post('/admin/sports/v1/sports', requestData);
    return response.data;
  }

  async updateSport(sportId: number, sportData: UpdateSportRequest, existingMediaId?: number) {
    let mediaId: number | undefined;

    // Upload new image if provided
    if (sportData.sport_image && sportData.sport_image instanceof File) {
      try {
        const mediaResponse = await this.uploadMedia(sportData.sport_image, sportData.name || 'Sport Image', existingMediaId);
        mediaId = mediaResponse.id || mediaResponse.media_id;
      } catch (error) {
        console.error('Failed to upload image:', error);
        throw new Error('Failed to upload image. Please try again.');
      }
    }

    // Update sport with media_id
    const requestData: any = {};

    if (sportData.name !== undefined) {
      requestData.name = sportData.name;
    }
    if (sportData.status !== undefined) {
      requestData.status = sportData.status;
    }
    if (sportData.description !== undefined) {
      requestData.description = sportData.description || '';
    }
    if (mediaId !== undefined) {
      requestData.media_id = mediaId;
    }

    const response = await this.api.patch(`/admin/sports/v1/sports/${sportId}`, requestData);
    return response.data;
  }

  async deleteSport(sportId: number) {
    const response = await this.api.delete(`/admin/sports/v1/sports/${sportId}`);
    return response.data;
  }
}

export const sportService = new SportService();

