import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { CreateCenterRequest, UpdateCenterRequest } from '../../types';

export interface CenterQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  [key: string]: unknown;
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
    const response = await this.api.post('/admin/centers/v1/centers', centerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async updateCenter(centerId: number, centerData: UpdateCenterRequest) {
    const response = await this.api.patch(`/admin/centers/v1/centers/${centerId}`, centerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async deleteCenter(centerId: number) {
    const response = await this.api.delete(`/admin/centers/v1/centers/${centerId}`);
    return response.data;
  }
}

export const centerService = new CenterService();
