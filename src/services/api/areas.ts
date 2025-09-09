import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateAreaRequest, UpdateAreaRequest } from '../../types';

export interface AreaQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
  center_id?: number;
}

export class AreaService extends BaseApiService {
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

  // Area management methods
  async getAreas(params?: AreaQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/areas/v1/areas', { params: queryParams });
    return response.data;
  }

  async getAreasByCenter(centerId: number, params?: AreaQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get(`/admin/centers/v1/centers/${centerId}/areas`, { params: queryParams });
    return response.data;
  }

  async getArea(centerId: number, areaId: number) {
    const response = await this.api.get(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`);
    return response.data;
  }

  async createArea(centerId: number, areaData: CreateAreaRequest) {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', areaData.name);
    formData.append('status', areaData.status);
    formData.append('floor', areaData.floor);
    
    if (areaData.description) {
      formData.append('description', areaData.description);
    }

    // Add images
    if (areaData.images && areaData.images.length > 0) {
      areaData.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await this.api.post(`/admin/centers/v1/centers/${centerId}/areas`, formData, {
      headers: {
        'Content-Type': undefined, // Let browser set the correct multipart/form-data header
      },
    });
    return response.data;
  }

  async updateArea(centerId: number, areaId: number, areaData: UpdateAreaRequest) {
    // Check if there are media changes (new images or removed images)
    const hasNewImages = areaData.images && areaData.images.length > 0;
    const hasExistingMedia = areaData.media_ids && areaData.media_ids.length > 0;
    const hasMediaChanges = hasNewImages || hasExistingMedia;

    if (hasMediaChanges) {
      try {
        const mediaFormData = new FormData();
        
        // Add new images with empty array format (images[])
        if (areaData.images && areaData.images.length > 0) {
          areaData.images.forEach((image) => {
            mediaFormData.append('images[]', image);
          });
        }
        
        // Add existing media with specific indices (images[1], images[2], etc.)
        if (areaData.media_ids && areaData.media_ids.length > 0) {
          areaData.media_ids.forEach((mediaId, index) => {
            mediaFormData.append(`images[${index}]`, mediaId.toString());
          });
        }
        
        // Add title for the media
        mediaFormData.append('title', `Area Images - ${areaData.name || 'Images'}`);

        const mediaResponse = await this.api.post('/admin/media/v1/media', mediaFormData, {
          headers: {
            'Content-Type': undefined, // Let browser set the correct multipart/form-data header
          },
        });

        // Extract media IDs from the response
        const uploadedMediaIds = mediaResponse.data?.data?.map((item: { id?: number; media_id?: number }) => item.id || item.media_id) || [];
        
        // Combine existing and new media IDs
        const allMediaIds = [
          ...(areaData.media_ids || []),
          ...uploadedMediaIds
        ];

        // Update area with all media IDs
        const updateFormData = new FormData();
        
        // Add fields only if they are provided
        if (areaData.name !== undefined) {
          updateFormData.append('name', areaData.name);
        }
        if (areaData.status !== undefined) {
          updateFormData.append('status', areaData.status);
        }
        if (areaData.floor !== undefined) {
          updateFormData.append('floor', areaData.floor);
        }
        if (areaData.description !== undefined) {
          updateFormData.append('description', areaData.description || '');
        }

        // Add all media IDs
        allMediaIds.forEach((mediaId) => {
          updateFormData.append('media_ids[]', mediaId.toString());
        });

        const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`, updateFormData, {
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
      if (areaData.name !== undefined) {
        formData.append('name', areaData.name);
      }
      if (areaData.status !== undefined) {
        formData.append('status', areaData.status);
      }
      if (areaData.floor !== undefined) {
        formData.append('floor', areaData.floor);
      }
      if (areaData.description !== undefined) {
        formData.append('description', areaData.description || '');
      }

      const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`, formData, {
        headers: {
          'Content-Type': undefined, // Let browser set the correct multipart/form-data header
        },
      });
      return response.data;
    }
  }

  async deleteArea(centerId: number, areaId: number) {
    const response = await this.api.delete(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`);
    return response.data;
  }
}

export const areaService = new AreaService();
