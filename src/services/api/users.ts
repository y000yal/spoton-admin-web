import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';
import type { User } from '../../types';

export interface UserQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  full_name: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  role_id: number;
  address: string;
  mobile_no: number;
  confirm_password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  role_id?: number;
  status?: number;
}

export class UserService extends BaseApiService {
  // User management methods
  async getUsers(params?: UserQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/account/v1/users', { params: queryParams });
    return response.data;
  }

  async getUser(userId: number) {
    const response = await this.api.get(`/admin/account/v1/users/${userId}`);
    return response.data;
  }

  async createUser(userData: CreateUserData) {
    const response = await this.api.post('/admin/account/v1/users', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: UpdateUserData) {
    const response = await this.api.patch(`/admin/account/v1/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await this.api.delete(`/admin/account/v1/users/${userId}`);
    return response.data;
  }
}

export const userService = new UserService();
