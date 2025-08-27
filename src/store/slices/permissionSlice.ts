import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
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
  } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPermissions(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchPermission = createAsyncThunk(
  'permissions/fetchPermission',
  async (permissionId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getPermission(permissionId);
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
      const response = await apiService.createPermission(permissionData);
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
      const response = await apiService.updatePermission(permissionId, permissionData);
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
      await apiService.deletePermission(permissionId);
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
      });
  },
});

export const { clearError, setCurrentPermission } = permissionSlice.actions;
export default permissionSlice.reducer;
