import React, { useEffect, useCallback } from 'react';
import type { AuthContextType, AuthProviderProps } from './AuthContextTypes';
import type { LoginCredentials } from '../types';
import { AuthContext } from './AuthContextInstance';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logoutUser, clearError, refreshCurrentUser } from '../store/slices/authSlice';
import { PermissionsProvider } from './PermissionsContext';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  const loginUser = async (credentials: LoginCredentials) => {
    await dispatch(login(credentials)).unwrap();
  };

  const logoutUserHandler = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    await dispatch(refreshCurrentUser()).unwrap();
  }, [dispatch]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // If user doesn't have role data, refresh it
        if (parsedUser && !parsedUser.role) {
          refreshUser().catch(error => {
            console.error('Failed to refresh user data:', error);
          });
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logoutUserHandler();
      }
    }
  }, [refreshUser, logoutUserHandler]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: loginUser,
    logout: logoutUserHandler,
    error,
    clearError: clearAuthError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <PermissionsProvider>
        {children}
      </PermissionsProvider>
    </AuthContext.Provider>
  );
};
