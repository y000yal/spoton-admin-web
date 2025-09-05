import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService, type PermissionQueryParams } from '../services/api/permissions';
import type { CreatePermissionRequest, UpdatePermissionRequest, PaginatedResponse, Permission } from '../types';

// Query keys
export const permissionsKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionsKeys.all, 'list'] as const,
  list: (params: PermissionQueryParams) => [...permissionsKeys.lists(), params] as const,
  details: () => [...permissionsKeys.all, 'detail'] as const,
  detail: (id: number) => [...permissionsKeys.details(), id] as const,
};

// Hooks for permissions list
export const usePermissions = (params: PermissionQueryParams) => {
  return useQuery<PaginatedResponse<Permission>>({
    queryKey: permissionsKeys.list(params),
    queryFn: () => permissionService.getPermissions(params),
    placeholderData: (previousData) => previousData,
  });
};

// Hook for single permission
export const usePermission = (permissionId: number) => {
  return useQuery({
    queryKey: permissionsKeys.detail(permissionId),
    queryFn: () => permissionService.getPermission(permissionId),
    enabled: !!permissionId,
  });
};

// Mutation for creating permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionData: CreatePermissionRequest) => permissionService.createPermission(permissionData),
    onSuccess: () => {
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionsKeys.lists() });
    },
  });
};

// Mutation for updating permission
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ permissionId, permissionData }: { permissionId: number; permissionData: UpdatePermissionRequest }) => 
      permissionService.updatePermission(permissionId, permissionData),
    onSuccess: (data, variables) => {
      // Update the specific permission in cache
      queryClient.setQueryData(permissionsKeys.detail(variables.permissionId), data);
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionsKeys.lists() });
    },
  });
};

// Mutation for deleting permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionId: number) => permissionService.deletePermission(permissionId),
    onSuccess: (_, permissionId) => {
      // Remove the permission from cache
      queryClient.removeQueries({ queryKey: permissionsKeys.detail(permissionId) });
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionsKeys.lists() });
    },
  });
};