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
        // Re-throw the original error to preserve the 422 response structure
        throw error;
      }
    }

    // Create sport with media_id
    const requestData: Record<string, unknown> = {
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

  async updateSport(sportId: number, sportData: UpdateSportRequest) {
    // Check if there are media changes (new image)
    const hasNewImage = sportData.sport_image && sportData.sport_image instanceof File;
    const hasMediaChanges = hasNewImage;

    if (hasMediaChanges) {
      try {
        const mediaFormData = new FormData();
        
        // Add new image with empty array format (images[])
        if (sportData.sport_image) {
          mediaFormData.append('images[]', sportData.sport_image);
        }
        
        // Add title for the media
        mediaFormData.append('title', `Sport Image - ${sportData.name || 'Image'}`);

        const mediaResponse = await this.api.post('/admin/media/v1/media', mediaFormData, {
          headers: {
            'Content-Type': undefined, // Let browser set the correct multipart/form-data header
          },
        });

        // Extract media ID from the response
        const uploadedMedia = mediaResponse.data?.data?.[0];
        const mediaId = uploadedMedia?.id || uploadedMedia?.media_id;

        // Update sport with media_id
        const requestData: Record<string, unknown> = {};

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
      } catch (error) {
        console.error('Failed to upload image:', error);
        // Re-throw the original error to preserve the 422 response structure
        throw error;
      }
    } else {
      // No media changes, just update other fields
      const requestData: Record<string, unknown> = {};

      if (sportData.name !== undefined) {
        requestData.name = sportData.name;
      }
      if (sportData.status !== undefined) {
        requestData.status = sportData.status;
      }
      if (sportData.description !== undefined) {
        requestData.description = sportData.description || '';
      }

      const response = await this.api.patch(`/admin/sports/v1/sports/${sportId}`, requestData);
      return response.data;
    }
  }

  async deleteSport(sportId: number) {
    const response = await this.api.delete(`/admin/sports/v1/sports/${sportId}`);
    return response.data;
  }
}

export const sportService = new SportService();

