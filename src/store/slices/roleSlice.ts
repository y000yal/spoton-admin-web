import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { roleService } from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { Role, CreateRoleRequest, UpdateRoleRequest, PaginatedResponse } from '../../types';

interface RoleState {
  roles: PaginatedResponse<Role> | null;
  currentRole: Role | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: null,
  currentRole: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (params: {
    limit?: number;
    page?: number;
    filter_field?: string;
    filter_value?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      const response = await roleService.getRoles(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (roleId: number, { rejectWithValue }) => {
    try {
      const response = await roleService.getRole(roleId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      const response = await roleService.createRole(roleData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ roleId, roleData }: { roleId: number; roleData: UpdateRoleRequest }, { rejectWithValue }) => {
    try {
      const response = await roleService.updateRole(roleId, roleData);
      return { roleId, response };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: number, { rejectWithValue }) => {
    try {
      await roleService.deleteRole(roleId);
      return roleId;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRole: (state, action: PayloadAction<Role | null>) => {
      state.currentRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<PaginatedResponse<Role>>) => {
        state.isLoading = false;
        state.roles = action.payload;
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single role
      .addCase(fetchRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.isLoading = false;
        state.currentRole = action.payload;
        state.error = null;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create role
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update role
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action: PayloadAction<{ roleId: number; response: Role }>) => {
        state.isLoading = false;
        state.error = null;
        
        // Update role in the list if it exists
        if (state.roles?.data) {
          const roleIndex = state.roles.data.findIndex(role => role.id === action.payload.roleId);
          if (roleIndex !== -1) {
            state.roles.data[roleIndex] = { ...state.roles.data[roleIndex] };
          }
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.error = null;
        
        // Remove role from the list
        if (state.roles?.data) {
          state.roles.data = state.roles.data.filter(role => role.id !== action.payload);
          state.roles.total = Math.max(0, state.roles.total - 1);
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
