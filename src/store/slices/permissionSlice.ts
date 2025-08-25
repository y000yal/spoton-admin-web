import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../../types';

interface PermissionState {
  permissions: Permission[];
  currentPermission: Permission | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  currentPermission: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPermissions();
      return response.data || [];
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
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
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
      .addCase(updatePermission.fulfilled, (state, action: PayloadAction<{ permissionId: number; response: any }>) => {
        state.isLoading = false;
        state.error = null;
        
        // Update permission in the list if it exists
        const permissionIndex = state.permissions.findIndex(permission => permission.id === action.payload.permissionId);
        if (permissionIndex !== -1) {
          state.permissions[permissionIndex] = { ...state.permissions[permissionIndex] };
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
        state.permissions = state.permissions.filter(permission => permission.id !== action.payload);
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPermission } = permissionSlice.actions;
export default permissionSlice.reducer;
