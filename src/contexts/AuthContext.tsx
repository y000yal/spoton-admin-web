import React, { useEffect } from 'react';
import type { AuthContextType, AuthProviderProps } from './AuthContextTypes';
import type { LoginCredentials } from '../types';
import { AuthContext } from './AuthContextInstance';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logoutUser, clearError, refreshCurrentUser } from '../store/slices/authSlice';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  const loginUser = async (credentials: LoginCredentials) => {
    await dispatch(login(credentials)).unwrap();
  };

  const logoutUserHandler = () => {
    dispatch(logoutUser());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const refreshUser = async () => {
    await dispatch(refreshCurrentUser()).unwrap();
  };

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
  }, []);

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
      {children}
    </AuthContext.Provider>
  );
};
