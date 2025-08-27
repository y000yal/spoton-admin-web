import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { AuthResponse, LoginCredentials } from '../types';
import { buildQueryParams } from '../utils/queryBuilder';

const API_BASE_URL = 'https://spoton.me/api';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              this.logout();
              return Promise.reject(error);
            }

            const response = await this.refreshToken(refreshToken);
            this.processQueue(null, response.access_token);
            
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(
      '/authentication/admins/v1/access-token',
      credentials
    );
    
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(
      '/authentication/admins/v1/refresh-token',
      { refresh_token: refreshToken }
    );
    
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  }

  // User management methods
  async getUsers(params?: {
    limit?: number;
    page?: number;
    filter_field?: string;
    filter_value?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/account/v1/users', { params: queryParams });
    return response.data;
  }

  async getUser(userId: number) {
    const response = await this.api.get(`/admin/account/v1/users/${userId}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.api.post('/admin/account/v1/users', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: any) {
    const response = await this.api.patch(`/admin/account/v1/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await this.api.delete(`/admin/account/v1/users/${userId}`);
    return response.data;
  }

  // Role management methods
  async getRoles(params?: {
    limit?: number;
    page?: number;
    filter_field?: string;
    filter_value?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/authorization/v1/roles', { params: queryParams });
    return response.data;
  }

  async getRole(roleId: number) {
    const response = await this.api.get(`/admin/authorization/v1/roles/${roleId}`);
    return response.data;
  }

  async createRole(roleData: any) {
    const response = await this.api.post('/admin/authorization/v1/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: number, roleData: any) {
    const response = await this.api.patch(`/admin/authorization/v1/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: number) {
    const response = await this.api.delete(`/admin/authorization/v1/roles/${roleId}`);
    return response.data;
  }

  // Permission management methods
  async getPermissions(params?: {
    limit?: number;
    page?: number;
    filter_field?: string;
    filter_value?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/authorization/v1/permissions', { params: queryParams });
    return response.data;
  }

  async getPermission(permissionId: number) {
    const response = await this.api.get(`/admin/authorization/v1/permissions/${permissionId}`);
    return response.data;
  }

  async createPermission(permissionData: any) {
    const response = await this.api.post('/admin/authorization/v1/permissions', permissionData);
    return response.data;
  }

  async updatePermission(permissionId: number, permissionData: any) {
    const response = await this.api.patch(`/admin/authorization/v1/permissions/${permissionId}`, permissionData);
    return response.data;
  }

  async deletePermission(permissionId: number) {
    const response = await this.api.delete(`/admin/authorization/v1/permissions/${permissionId}`);
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

export const apiService = new ApiService();
export default apiService;
