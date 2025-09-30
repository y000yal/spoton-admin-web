import { BaseApiService } from './base';
import type { AuthResponse, LoginCredentials, User } from '../../types';

export class AuthService extends BaseApiService {
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

  // Get current user's complete data (including role information)
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      // Use the /admin/v1/me endpoint to get current user data
      const response = await this.api.get<User>('/admin/v1/me');
      const userResponse = response.data;
      
      // If user has a role_id, fetch the role with permissions
      if (userResponse.role_id) {
        const { roleService } = await import('./roles');
        const [roleResponse, permissionsResponse] = await Promise.all([
          roleService.getRole(userResponse.role_id),
          roleService.getRolePermissions(userResponse.role_id)
        ]);
        
        // Return user with complete role and permissions data
        return {
          ...userResponse,
          role: {
            ...roleResponse,
            permissions: permissionsResponse.permissions || permissionsResponse.data || permissionsResponse
          }
        };
      }
      
      return userResponse;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Failed to get current user data');
    }
  }

  // Refresh current user data (useful when permissions change)
  async refreshCurrentUser(): Promise<User> {
    const user = await this.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

}

export const authService = new AuthService();
