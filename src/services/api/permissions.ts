import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';

export interface PermissionQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreatePermissionData {
  name: string;
  display_name: string;
  description: string;
  status: string;
}

export interface UpdatePermissionData {
  name?: string;
  display_name?: string;
  description?: string;
  status?: string;
}

export class PermissionService extends BaseApiService {
  // Permission management methods
  async getPermissions(params?: PermissionQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/authorization/v1/permissions', { params: queryParams });
    return response.data;
  }

  async getPermission(permissionId: number) {
    const response = await this.api.get(`/admin/authorization/v1/permissions/${permissionId}`);
    return response.data;
  }

  async createPermission(permissionData: CreatePermissionData) {
    const response = await this.api.post('/admin/authorization/v1/permissions', permissionData);
    return response.data;
  }

  async updatePermission(permissionId: number, permissionData: UpdatePermissionData) {
    const response = await this.api.patch(`/admin/authorization/v1/permissions/${permissionId}`, permissionData);
    return response.data;
  }

  async deletePermission(permissionId: number) {
    const response = await this.api.delete(`/admin/authorization/v1/permissions/${permissionId}`);
    return response.data;
  }
}

export const permissionService = new PermissionService();
