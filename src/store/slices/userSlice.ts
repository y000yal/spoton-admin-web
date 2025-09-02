import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { User, CreateUserRequest, UpdateUserRequest, PaginatedResponse } from '../../types';

interface UserState {
  users: PaginatedResponse<User> | null;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    page: number;
    limit: number;
    search: string;
    status: string;
    role_id: number | null;
  };
}

const initialState: UserState = {
  users: null,
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    role_id: null,
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { 
    page: number; 
    limit: number; 
    filter_field?: string;
    filter_value?: string;
    sort_field?: string;
    sort_by?: 'asc' | 'desc';
    forceRefresh?: boolean;
    [key: string]: any; // Allow dynamic filter keys like filter[name]
  }, { rejectWithValue, getState }) => {
    const state = getState() as { users: UserState };
    const existingUsers = state.users.users;
    
    // Check if there are any filter parameters (including dynamic ones like filter[name])
    const hasFilters = Object.keys(params).some(key => 
      key.startsWith('filter[') || 
      params.filter_field || 
      params.filter_value || 
      params.sort_field
    );
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingUsers && 
      existingUsers.per_page !== params.limit;
    
    // Don't fetch if we already have users and no specific filters are applied and no force refresh is requested and no page size change
    if (existingUsers && !hasFilters && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 fetchUsers: Returning existing users (no filters, no force refresh, no page size change)");
      return existingUsers;
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 fetchUsers: Page size changed - fetching fresh data");
    }
    
    if (params.forceRefresh) {
      console.log("🔄 fetchUsers: Force refresh requested - fetching fresh data");
    }
    
    try {
      console.log("🔄 fetchUsers: Making API call to getUsers with params:", params);
      const response = await userService.getUsers(params);
      console.log("🔄 fetchUsers: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (userId: number, { rejectWithValue, getState }) => {
    const state = getState() as { users: UserState };
    const currentUser = state.users.currentUser;
    
    // Don't fetch if we already have the user and it's the same ID
    if (currentUser && currentUser.id === userId) {
      return currentUser;
    }
    
    try {
      const response = await userService.getUser(userId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Enhanced search users thunk with better filter handling
export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (params: {
    page: number;
    limit: number;
    searchField?: string;
    searchValue?: string;
    sort_field?: string;
    sort_by?: 'asc' | 'desc';
    forceRefresh?: boolean;
  }, { rejectWithValue, getState }) => {
    const state = getState() as { users: UserState };
    const existingUsers = state.users.users;
    
    // Check if we have existing users and if this is a search request
    const isSearchRequest = params.searchValue && params.searchValue.trim();
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingUsers && 
      existingUsers.per_page !== params.limit;
    
    // Don't fetch if we already have users and this is not a search request and no force refresh and no page size change
    if (existingUsers && !isSearchRequest && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 searchUsers: Returning existing users (no search, no force refresh, no page size change)");
      return existingUsers;
    }
    
    // Build the API parameters
    const apiParams: Record<string, any> = {
      page: params.page,
      limit: params.limit,
    };
    
    // Add search filter if provided
    if (isSearchRequest && params.searchField) {
      apiParams[`filter[${params.searchField}]`] = params.searchValue.trim();
    }
    
    // Add sorting if provided
    if (params.sort_field) {
      apiParams.sort_field = params.sort_field;
      apiParams.sort_by = params.sort_by || 'asc';
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 searchUsers: Page size changed - fetching fresh data");
    }
    
    if (params.forceRefresh) {
      console.log("🔄 searchUsers: Force refresh requested - fetching fresh data");
    }
    
    try {
      console.log("🔄 searchUsers: Making API call with params:", apiParams);
      const response = await userService.getUsers(apiParams);
      console.log("🔄 searchUsers: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: number; userData: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(userId, userData);
      return { userId, response };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      return userId;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<UserState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = null;
    },
    resetUsersState: (state) => {
      state.users = null;
      state.currentUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User>>) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single user
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<{ userId: number; response: User }>) => {
        state.isLoading = false;
        state.error = null;
        
        // Update user in the list if it exists
        if (state.users?.data) {
          const userIndex = state.users.data.findIndex(user => user.id === action.payload.userId);
          if (userIndex !== -1) {
            // Update the user data (you might want to refetch the user list instead)
            state.users.data[userIndex] = { ...state.users.data[userIndex] };
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.error = null;
        
        // Remove user from the list
        if (state.users?.data) {
          state.users.data = state.users.data.filter(user => user.id !== action.payload);
          state.users.total = Math.max(0, state.users.total - 1);
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User>>) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  resetFilters, 
  setCurrentUser, 
  clearUsers, 
  resetUsersState 
} = userSlice.actions;
export default userSlice.reducer;
