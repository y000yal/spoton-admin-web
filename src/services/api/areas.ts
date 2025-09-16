import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateAreaRequest, UpdateAreaRequest } from '../../types';

export interface AreaQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  center_id?: number;
  [key: string]: unknown;
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
    const response = await this.api.post(`/admin/centers/v1/centers/${centerId}/areas`, areaData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async updateArea(centerId: number, areaId: number, areaData: UpdateAreaRequest) {
    const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`, areaData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteArea(centerId: number, areaId: number) {
    const response = await this.api.delete(`/admin/centers/v1/centers/${centerId}/areas/${areaId}`);
    return response.data;
  }
}

export const areaService = new AreaService();
