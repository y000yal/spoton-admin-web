import { BaseApiService } from './base';
import type { AuthResponse, LoginCredentials, User } from '../../types';
import { jwtDecode } from 'jwt-decode';

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
      // Decode the JWT token to get user information
      const decodedToken = jwtDecode(token) as { sub?: string; user_id?: number; id?: number };
      
      // Try different possible field names for user ID
      const userId = decodedToken.user_id || decodedToken.id || decodedToken.sub;
      
      if (!userId) {
        throw new Error('Could not extract user ID from token');
      }

      // Fetch the complete user data using the ID
      const { userService } = await import('./users');
      const response = await userService.getUser(Number(userId));
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Failed to get current user data');
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
