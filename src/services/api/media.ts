import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateMediaRequest, UpdateMediaRequest, MediaQueryParams } from '../../types';

export class MediaService extends BaseApiService {
  // Get all media with pagination and filtering
  async getMedia(params?: MediaQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/media/v1/media', { params: queryParams });
    return response.data;
  }

  // Get single media by ID
  async getMediaById(mediaId: number) {
    const response = await this.api.get(`/admin/media/v1/media/${mediaId}`);
    return response.data;
  }

  // Create new media (upload images)
  async createMedia(mediaData: CreateMediaRequest) {
    const formData = new FormData();
    
    // Add images array
    mediaData.images.forEach((image) => {
      formData.append('images[]', image);
    });
    
    // Add user_id
    formData.append('user_id', mediaData.user_id.toString());
    
    // Add title if provided
    if (mediaData.title) {
      formData.append('title', mediaData.title);
    }

    const response = await this.api.post('/admin/media/v1/media', formData, {
      headers: {
        'Content-Type': undefined, // Let browser set the correct multipart/form-data header
      },
    });
    return response.data;
  }

  // Update media
  async updateMedia(mediaId: number, mediaData: UpdateMediaRequest) {
    const response = await this.api.patch(`/admin/media/v1/media/${mediaId}`, mediaData);
    return response.data;
  }

  // Delete single media
  async deleteMedia(mediaId: number) {
    console.log('Deleting single media with ID:', mediaId);
    
    const response = await this.api.delete(`/admin/media/v1/media/${mediaId}`);
    
    console.log('Single delete response:', response.data);
    return response.data;
  }

  // Delete multiple media
  async deleteMultipleMedia(mediaIds: number[], userId: number) {
    // Validate input
    if (!mediaIds || mediaIds.length === 0) {
      throw new Error('No media IDs provided for deletion');
    }
    
    if (!userId) {
      throw new Error('User ID is required for deletion');
    }
    
    const requestData = { 
      user_id: userId.toString(),
      media_ids: mediaIds
    };
    
    console.log('Deleting media with request data:', requestData);
    console.log('Media IDs to delete:', mediaIds);
    console.log('User ID:', userId);
    
    const response = await this.api.delete('/admin/media/v1/media', {
      data: requestData
    });
    
    console.log('Delete response:', response.data);
    return response.data;
  }
}

export const mediaService = new MediaService();
