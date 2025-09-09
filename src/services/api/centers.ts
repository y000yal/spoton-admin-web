import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateCenterRequest, UpdateCenterRequest } from '../../types';

export interface CenterQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}

export class CenterService extends BaseApiService {
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

  // Center management methods
  async getCenters(params?: CenterQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/centers/v1/centers', { params: queryParams });
    return response.data;
  }

  async getCenter(centerId: number) {
    const response = await this.api.get(`/admin/centers/v1/centers/${centerId}`);
    return response.data;
  }

  async createCenter(centerData: CreateCenterRequest) {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', centerData.name);
    formData.append('country_id', centerData.country_id.toString());
    formData.append('address', centerData.address);
    formData.append('longitude', centerData.longitude.toString());
    formData.append('latitude', centerData.latitude.toString());
    formData.append('status', centerData.status);
    
    if (centerData.description) {
      formData.append('description', centerData.description);
    }

    // Add images
    if (centerData.images && centerData.images.length > 0) {
      centerData.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await this.api.post('/admin/centers/v1/centers', formData, {
      headers: {
        'Content-Type': undefined, // Let browser set the correct multipart/form-data header
      },
    });
    return response.data;
  }

  async updateCenter(centerId: number, centerData: UpdateCenterRequest) {
    // Check if there are media changes (new images or removed images)
    const hasNewImages = centerData.images && centerData.images.length > 0;
    const hasExistingMedia = centerData.media_ids && centerData.media_ids.length > 0;
    const hasMediaChanges = hasNewImages || hasExistingMedia;

    if (hasMediaChanges) {
      try {
        const mediaFormData = new FormData();
        
        // Add new images with empty array format (images[])
        if (centerData.images && centerData.images.length > 0) {
          centerData.images.forEach((image) => {
            mediaFormData.append('images[]', image);
          });
        }
        
        // Add existing media with specific indices (images[59], images[60], etc.)
        if (centerData.media_ids && centerData.media_ids.length > 0) {
          centerData.media_ids.forEach((mediaId) => {
            mediaFormData.append(`images[${mediaId}]`, mediaId.toString());
          });
        }
        
        // Add title for the media
        mediaFormData.append('title', `Center Images - ${centerData.name || 'Images'}`);

        const mediaResponse = await this.api.post('/admin/media/v1/media', mediaFormData, {
          headers: {
            'Content-Type': undefined, // Let browser set the correct multipart/form-data header
          },
        });

        // Extract media IDs from the response
        const uploadedMediaIds = mediaResponse.data?.data?.map((item: { id?: number; media_id?: number }) => item.id || item.media_id) || [];
        
        // Combine existing and new media IDs
        const allMediaIds = [
          ...(centerData.media_ids || []),
          ...uploadedMediaIds
        ];

        // Update center with all media IDs
        const updateFormData = new FormData();
        
        // Add fields only if they are provided
        if (centerData.name !== undefined) {
          updateFormData.append('name', centerData.name);
        }
        if (centerData.country_id !== undefined) {
          updateFormData.append('country_id', centerData.country_id.toString());
        }
        if (centerData.address !== undefined) {
          updateFormData.append('address', centerData.address);
        }
        if (centerData.longitude !== undefined) {
          updateFormData.append('longitude', centerData.longitude.toString());
        }
        if (centerData.latitude !== undefined) {
          updateFormData.append('latitude', centerData.latitude.toString());
        }
        if (centerData.status !== undefined) {
          updateFormData.append('status', centerData.status);
        }
        if (centerData.description !== undefined) {
          updateFormData.append('description', centerData.description || '');
        }

        // Add all media IDs
        allMediaIds.forEach((mediaId) => {
          updateFormData.append('media_ids[]', mediaId.toString());
        });

        const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}`, updateFormData, {
          headers: {
            'Content-Type': undefined, // Let browser set the correct multipart/form-data header
          },
        });
        return response.data;
      } catch (error) {
        console.error('Failed to upload images:', error);
        throw error;
      }
    } else {
      // No media changes, just update other fields
      const formData = new FormData();
      
      // Add fields only if they are provided
      if (centerData.name !== undefined) {
        formData.append('name', centerData.name);
      }
      if (centerData.country_id !== undefined) {
        formData.append('country_id', centerData.country_id.toString());
      }
      if (centerData.address !== undefined) {
        formData.append('address', centerData.address);
      }
      if (centerData.longitude !== undefined) {
        formData.append('longitude', centerData.longitude.toString());
      }
      if (centerData.latitude !== undefined) {
        formData.append('latitude', centerData.latitude.toString());
      }
      if (centerData.status !== undefined) {
        formData.append('status', centerData.status);
      }
      if (centerData.description !== undefined) {
        formData.append('description', centerData.description || '');
      }

      const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}`, formData, {
        headers: {
          'Content-Type': undefined, // Let browser set the correct multipart/form-data header
        },
      });
      return response.data;
    }
  }

  async deleteCenter(centerId: number) {
    const response = await this.api.delete(`/admin/centers/v1/centers/${centerId}`);
    return response.data;
  }
}

export const centerService = new CenterService();
