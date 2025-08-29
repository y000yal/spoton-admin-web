import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { roleService } from '../../services/api';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { Role, CreateRoleRequest, UpdateRoleRequest, PaginatedResponse } from '../../types';

interface RoleState {
  roles: PaginatedResponse<Role> | null;
  currentRole: Role | null;
  rolePermissions: { roleId: number; permissions: Record<string, unknown> } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: null,
  currentRole: null,
  rolePermissions: null,
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
    forceRefresh?: boolean;
    [key: string]: any; // Allow dynamic filter keys like filter[name]
  } = {}, { rejectWithValue, getState }) => {
    const state = getState() as { roles: RoleState };
    const existingRoles = state.roles.roles;
    
    // Check if there are any filter parameters (including dynamic ones like filter[name])
    const hasFilters = Object.keys(params).some(key => 
      key.startsWith('filter[') || 
      params.filter_field || 
      params.filter_value || 
      params.sort_by
    );
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingRoles && 
      existingRoles.per_page !== params.limit;
    
    // Don't fetch if we already have roles and no specific filters are applied and no force refresh is requested and no page size change
    if (existingRoles && !hasFilters && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 fetchRoles: Returning existing roles (no filters, no force refresh, no page size change)");
      return existingRoles;
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 fetchRoles: Page size changed - fetching fresh data");
    }
    
    if (params.forceRefresh) {
      console.log("🔄 fetchRoles: Force refresh requested - fetching fresh data");
    }
    
    try {
      console.log("🔄 fetchRoles: Making API call to getRoles with params:", params);
      const response = await roleService.getRoles(params);
      console.log("🔄 fetchRoles: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchRole = createAsyncThunk(
  'roles/fetchRole',
  async (roleId: number, { rejectWithValue, getState }) => {
    const state = getState() as { roles: RoleState };
    const existingRole = state.roles.currentRole;
    
    // Don't fetch if we already have the same role
    if (existingRole && existingRole.id === roleId) {
      return existingRole;
    }
    
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

// Role permissions thunks
export const fetchRolePermissions = createAsyncThunk(
  'roles/fetchRolePermissions',
  async (roleId: number, { rejectWithValue, getState }) => {
    const state = getState() as { roles: RoleState };
    const existingPermissions = state.roles.rolePermissions;
    
    // Don't fetch if we already have permissions for this role
    if (existingPermissions && existingPermissions.roleId === roleId) {
      return existingPermissions;
    }
    
    try {
      const response = await roleService.getRolePermissions(roleId);
      return { roleId, permissions: response };
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const assignRolePermissions = createAsyncThunk(
  'roles/assignRolePermissions',
  async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await roleService.assignPermissions(roleId, permissionIds);
      return { roleId, permissionIds, response };
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
      })
      
      // Fetch role permissions
      .addCase(fetchRolePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rolePermissions = action.payload;
        state.error = null;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Assign role permissions
      .addCase(assignRolePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignRolePermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Update role permissions after assignment
        if (state.rolePermissions && state.rolePermissions.roleId === action.payload.roleId) {
          state.rolePermissions.permissions = action.payload.response;
        }
      })
      .addCase(assignRolePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
