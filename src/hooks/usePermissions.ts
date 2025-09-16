import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService, type CreatePermissionData } from '../services/api/permissions';
import { useAuth } from './useAuth';
import type { Permission, PaginatedResponse } from '../types';
import { usePermissions as usePermissionCheck } from './usePermissionCheck';

// Query keys for permissions
export const permissionsKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionsKeys.all, 'list'] as const,
  list: () => [...permissionsKeys.lists()] as const,
};

// Hook to fetch all available permissions
export const useAllPermissions = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery<PaginatedResponse<Permission>>({
    queryKey: permissionsKeys.list(),
    queryFn: () => permissionService.getPermissions({ limit: 1000 }), // Get all permissions
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: isAuthenticated, // Only fetch permissions when user is authenticated
  });
};

// Hook to get permissions as a map for quick lookup
export const usePermissionsMap = () => {
  const { data: permissionsResponse, ...rest } = useAllPermissions();
  
  // Extract the actual permissions array from the paginated response
  const permissions = permissionsResponse?.data || [];
  
  const permissionsMap = permissions.reduce((acc: Record<string, Permission>, permission: Permission) => {
    acc[permission.slug] = permission;
    return acc;
  }, {} as Record<string, Permission>);
  
  return {
    permissionsMap,
    permissions,
    ...rest
  };
};

// Hook to fetch permissions with query parameters (for data tables)
export const usePermissionsData = (queryParams?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...permissionsKeys.lists(), queryParams],
    queryFn: () => permissionService.getPermissions(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single permission by ID
export const usePermission = (permissionId: number) => {
  return useQuery<Permission>({
    queryKey: [...permissionsKeys.all, 'detail', permissionId],
    queryFn: () => permissionService.getPermission(permissionId),
    enabled: !!permissionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a permission
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (permissionData: CreatePermissionData) => permissionService.createPermission(permissionData),
    onSuccess: () => {
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionsKeys.all });
    },
  });
};

// Hook to delete a permission
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (permissionId: number) => permissionService.deletePermission(permissionId),
    onSuccess: () => {
      // Invalidate and refetch permissions list
      queryClient.invalidateQueries({ queryKey: permissionsKeys.all });
    },
  });
};

// Re-export the usePermissions hook from usePermissionCheck for convenience
export { usePermissionCheck as usePermissions };