import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, type RoleQueryParams } from '../services/api/roles';
import type { CreateRoleRequest, UpdateRoleRequest, PaginatedResponse, Role } from '../types';

// Query keys
export const rolesKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesKeys.all, 'list'] as const,
  list: (params: RoleQueryParams) => [...rolesKeys.lists(), params] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: number) => [...rolesKeys.details(), id] as const,
  permissions: () => [...rolesKeys.all, 'permissions'] as const,
  rolePermissions: (roleId: number) => [...rolesKeys.permissions(), roleId] as const,
};

// Hooks for roles list
export const useRoles = (params: RoleQueryParams) => {
  return useQuery<PaginatedResponse<Role>>({
    queryKey: rolesKeys.list(params),
    queryFn: () => roleService.getRoles(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single role
export const useRole = (roleId: number) => {
  return useQuery({
    queryKey: rolesKeys.detail(roleId),
    queryFn: () => roleService.getRole(roleId),
    enabled: !!roleId,
  });
};

// Mutation for creating role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: CreateRoleRequest) => roleService.createRole(roleData),
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

// Mutation for updating role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, roleData }: { roleId: number; roleData: UpdateRoleRequest }) => 
      roleService.updateRole(roleId, roleData),
    onSuccess: (data, variables) => {
      // Update the specific role in cache
      queryClient.setQueryData(rolesKeys.detail(variables.roleId), data);
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

// Mutation for deleting role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: number) => roleService.deleteRole(roleId),
    onSuccess: (_, roleId) => {
      // Remove the role from cache
      queryClient.removeQueries({ queryKey: rolesKeys.detail(roleId) });
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

// Hook for role permissions
export const useRolePermissions = (roleId: number) => {
  return useQuery({
    queryKey: rolesKeys.rolePermissions(roleId),
    queryFn: () => roleService.getRolePermissions(roleId),
    enabled: !!roleId,
  });
};

// Mutation for assigning role permissions
export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      roleService.assignPermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      // Invalidate and refetch role permissions
      queryClient.invalidateQueries({ queryKey: rolesKeys.rolePermissions(variables.roleId) });
      // Also invalidate the role detail to ensure consistency
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.roleId) });
    },
  });
};
