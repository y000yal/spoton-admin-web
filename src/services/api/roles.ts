import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';

export interface RoleQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateRoleData {
  name: string;
  display_name?: string;
  description?: string;
  status: string;
}

export interface UpdateRoleData {
  name?: string;
  display_name?: string;
  description?: string;
  status?: string;
}

export class RoleService extends BaseApiService {
  // Role management methods
  async getRoles(params?: RoleQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/authorization/v1/roles', { params: queryParams });
    return response.data;
  }

  async getRole(roleId: number) {
    const response = await this.api.get(`/admin/authorization/v1/roles/${roleId}`);
    return response.data;
  }

  async createRole(roleData: CreateRoleData) {
    const response = await this.api.post('/admin/authorization/v1/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: number, roleData: UpdateRoleData) {
    const response = await this.api.patch(`/admin/authorization/v1/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: number) {
    const response = await this.api.delete(`/admin/authorization/v1/roles/${roleId}`);
    return response.data;
  }

  // Role permissions methods
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const response = await this.api.post('/admin/authorization/v1/roles/sync-permissions', {
      role_id: roleId,
      permission_id: permissionIds,
    });
    return response.data;
  }

  async getRolePermissions(roleId: number) {
    const response = await this.api.get(`/admin/authorization/v1/roles/${roleId}/permissions`);
    return response.data;
  }
}

export const roleService = new RoleService();
