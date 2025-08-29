import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { permissionService } from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest, PaginatedResponse } from '../../types';

interface PermissionState {
  permissions: PaginatedResponse<Permission> | null;
  currentPermission: Permission | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: null,
  currentPermission: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (params: {
    limit?: number;
    page?: number;
    filter_field?: string;
    filter_value?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    forceRefresh?: boolean;
    [key: string]: any; // Allow dynamic filter keys like filter[name]
  } = {}, { rejectWithValue, getState }) => {
    const state = getState() as { permissions: PermissionState };
    const existingPermissions = state.permissions.permissions;
    
    // Check if there are any filter parameters (including dynamic ones like filter[name])
    const hasFilters = Object.keys(params).some(key => 
      key.startsWith('filter[') || 
      params.filter_field || 
      params.filter_value || 
      params.sort_by
    );
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingPermissions && 
      existingPermissions.per_page !== params.limit;
    
    // Don't fetch if we already have permissions and no specific filters are applied and no force refresh is requested and no page size change
    if (existingPermissions && !hasFilters && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 fetchPermissions: Returning existing permissions (no filters, no force refresh, no page size change)");
      return existingPermissions;
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 fetchPermissions: Page size changed - fetching fresh data");
    }
    
    if (params.forceRefresh) {
      console.log("🔄 fetchPermissions: Force refresh requested - fetching fresh data");
    }
    
    try {
      console.log("🔄 fetchPermissions: Making API call to getPermissions with params:", params);
      const response = await permissionService.getPermissions(params);
      console.log("🔄 fetchPermissions: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchPermission = createAsyncThunk(
  'permissions/fetchPermission',
  async (permissionId: number, { rejectWithValue, getState }) => {
    const state = getState() as { permissions: PermissionState };
    const existingPermission = state.permissions.currentPermission;
    
    // Don't fetch if we already have the same permission
    if (existingPermission && existingPermission.id === permissionId) {
      return existingPermission;
    }
    
    try {
      const response = await permissionService.getPermission(permissionId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createPermission = createAsyncThunk(
  'permissions/createPermission',
  async (permissionData: CreatePermissionRequest, { rejectWithValue }) => {
    try {
      const response = await permissionService.createPermission(permissionData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Enhanced search permissions thunk with better filter handling
export const searchPermissions = createAsyncThunk(
  'permissions/searchPermissions',
  async (params: {
    limit?: number;
    page?: number;
    searchField?: string;
    searchValue?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    forceRefresh?: boolean;
  } = {}, { rejectWithValue, getState }) => {
    const state = getState() as { permissions: PermissionState };
    const existingPermissions = state.permissions.permissions;
    
    // Check if we have existing permissions and if this is a search request
    const isSearchRequest = params.searchValue && params.searchValue.trim();
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingPermissions && 
      existingPermissions.per_page !== params.limit;
    
    // Don't fetch if we already have permissions and this is not a search request and no force refresh and no page size change
    if (existingPermissions && !isSearchRequest && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 searchPermissions: Returning existing permissions (no search, no force refresh, no page size change)");
      return existingPermissions;
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 searchPermissions: Page size changed - fetching fresh data");
    }
    
    // Build the API parameters
    const apiParams: Record<string, any> = {
      limit: params.limit || 10,
      page: params.page || 1,
    };
    
    // Add search filter if provided
    if (isSearchRequest && params.searchField) {
      apiParams[`filter[${params.searchField}]`] = params.searchValue.trim();
    }
    
    // Add sorting if provided
    if (params.sort_by) {
      apiParams.sort_by = params.sort_by;
      apiParams.sort_order = params.sort_order || 'asc';
    }
    
    if (params.forceRefresh) {
      console.log("🔄 searchPermissions: Force refresh requested - fetching fresh data");
    }
    
    try {
      console.log("🔄 searchPermissions: Making API call with params:", apiParams);
      const response = await permissionService.getPermissions(apiParams);
      console.log("🔄 searchPermissions: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updatePermission = createAsyncThunk(
  'permissions/updatePermission',
  async ({ permissionId, permissionData }: { permissionId: number; permissionData: UpdatePermissionRequest }, { rejectWithValue }) => {
    try {
      const response = await permissionService.updatePermission(permissionId, permissionData);
      return { permissionId, response };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deletePermission = createAsyncThunk(
  'permissions/deletePermission',
  async (permissionId: number, { rejectWithValue }) => {
    try {
      await permissionService.deletePermission(permissionId);
      return permissionId;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPermission: (state, action: PayloadAction<Permission | null>) => {
      state.currentPermission = action.payload;
    },
    clearPermissions: (state) => {
      state.permissions = null;
    },
    resetPermissionsState: (state) => {
      state.permissions = null;
      state.currentPermission = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<PaginatedResponse<Permission>>) => {
        state.isLoading = false;
        state.permissions = action.payload;
        state.error = null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single permission
      .addCase(fetchPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.isLoading = false;
        state.currentPermission = action.payload;
        state.error = null;
      })
      .addCase(fetchPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create permission
      .addCase(createPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update permission
      .addCase(updatePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action: PayloadAction<{ permissionId: number; response: Permission }>) => {
        state.isLoading = false;
        state.error = null;
        
        // Update permission in the list if it exists
        if (state.permissions?.data) {
          const permissionIndex = state.permissions.data.findIndex(permission => permission.id === action.payload.permissionId);
          if (permissionIndex !== -1) {
            state.permissions.data[permissionIndex] = { ...state.permissions.data[permissionIndex] };
          }
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete permission
      .addCase(deletePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.error = null;
        
        // Remove permission from the list
        if (state.permissions?.data) {
          state.permissions.data = state.permissions.data.filter(permission => permission.id !== action.payload);
          state.permissions.total = Math.max(0, state.permissions.total - 1);
        }
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search permissions
      .addCase(searchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPermissions.fulfilled, (state, action: PayloadAction<PaginatedResponse<Permission>>) => {
        state.isLoading = false;
        state.permissions = action.payload;
        state.error = null;
      })
      .addCase(searchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setCurrentPermission, 
  clearPermissions, 
  resetPermissionsState 
} = permissionSlice.actions;
export default permissionSlice.reducer;
