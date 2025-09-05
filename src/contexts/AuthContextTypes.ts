import type { ReactNode } from 'react';
import type { LoginCredentials, User } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
