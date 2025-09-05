import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { LoginCredentials, AuthResponse, User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  })(),
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // First, login to get tokens
      const authResponse = await authService.login(credentials);
      
      // After successful login, fetch the complete user data
      const userData = await authService.getCurrentUser();
      
      // Return both auth response and user data
      return {
        auth: authResponse,
        user: userData
      };
    } catch (error: unknown) {
      console.log('Login error caught:', error, 'Type:', typeof error);
      const errorMessage = extractErrorMessage(error);
      console.log('Extracted error message:', errorMessage, 'Type:', typeof errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Get the current user's ID from localStorage or we'll need to decode the token
      // For now, let's assume we can get it from the token or we'll need to modify the login flow
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token available');
      }
      
      // We need to get the user ID from the token or modify the login response
      // For now, let's create a placeholder - we'll need to modify this
      throw new Error('Need to implement user ID extraction from token');
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(refreshToken);
      return response;
    } catch (error: unknown) {
      console.log('Refresh token error caught:', error, 'Type:', typeof error);
      const errorMessage = extractErrorMessage(error);
      console.log('Extracted refresh token error message:', errorMessage, 'Type:', typeof errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshCurrentUser = createAsyncThunk(
  'auth/refreshCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.refreshCurrentUser();
      return userData;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ auth: AuthResponse; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.auth.access_token;
        state.refreshToken = action.payload.auth.refresh_token;
        state.user = action.payload.user;
        state.error = null;
        
        // Store tokens in localStorage
        localStorage.setItem('access_token', action.payload.auth.access_token);
        localStorage.setItem('refresh_token', action.payload.auth.refresh_token);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        const errorMessage = typeof action.payload === 'string' 
          ? action.payload 
          : 'Login failed';
        console.log('Login rejected - payload:', action.payload, 'stored error:', errorMessage);
        state.error = errorMessage;
      })
      
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        
        // Update tokens in localStorage
        localStorage.setItem('access_token', action.payload.access_token);
        localStorage.setItem('refresh_token', action.payload.refresh_token);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        // Ensure error is always a string
        const errorMessage = typeof action.payload === 'string' 
          ? action.payload 
          : 'Token refresh failed';
        console.log('Refresh token rejected - payload:', action.payload, 'stored error:', errorMessage);
        state.error = errorMessage;
        // If refresh fails, logout the user
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      })
      
      // Refresh current user
      .addCase(refreshCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(refreshCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        const errorMessage = typeof action.payload === 'string' 
          ? action.payload 
          : 'Failed to refresh user data';
        state.error = errorMessage;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = null;
      });
  },
});

export const { clearError, setUser, updateToken } = authSlice.actions;
export default authSlice.reducer;
