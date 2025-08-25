import React, { useEffect } from 'react';
import type { AuthContextType, AuthProviderProps } from './AuthContextTypes';
import type { LoginCredentials } from '../types';
import { AuthContext } from './AuthContextInstance';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logoutUser, clearError } from '../store/slices/authSlice';

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

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // The Redux slice will handle this automatically
        // We could dispatch setUser here if needed
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
