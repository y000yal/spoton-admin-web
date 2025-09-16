import { useAuth } from './useAuth';
import { usePermissionsContext } from '../contexts/PermissionsContext';
import { 
  hasPermission as checkPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  canAccessRoute,
  getPermissionsByPattern,
  permissionExists
} from '../utils/dynamicPermissions';

/**
 * Hook that provides dynamic permission checking capabilities
 * Works with any permission slug without hardcoding
 */
export const useDynamicPermissions = () => {
  const { user } = useAuth();
  const { permissions, permissionsMap, isLoading, error } = usePermissionsContext();

  return {
    // Permission checking functions
    hasPermission: (permission: string) => checkPermission(user, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    canAccessRoute: (route: string, permissionPattern?: string) => canAccessRoute(user, route, permissionPattern),
    
    // Permission data
    permissions,
    permissionsMap,
    userPermissions: user?.role?.permissions || [],
    
    // Utility functions
    getPermissionsByPattern: (pattern: string) => getPermissionsByPattern(permissions, pattern),
    permissionExists: (permissionSlug: string) => permissionExists(permissions, permissionSlug),
    
    // Loading states
    isLoading,
    error,
  };
};

/**
 * Hook for checking specific resource permissions
 * Automatically generates permission slugs based on resource and action
 */
export const useResourcePermissions = (resource: string) => {
  const { hasPermission, getPermissionsByPattern } = useDynamicPermissions();
  
  // Common permission patterns for resources
  const permissions = {
    view: `${resource}-index`,
    create: `${resource}-store`,
    edit: `${resource}-update`,
    delete: `${resource}-destroy`,
    show: `${resource}-show`,
    viewRoute: `${resource}-view`,
  };
  
  return {
    canView: () => hasPermission(permissions.view),
    canCreate: () => hasPermission(permissions.create),
    canEdit: () => hasPermission(permissions.edit),
    canDelete: () => hasPermission(permissions.delete),
    canShow: () => hasPermission(permissions.show),
    canViewRoute: () => hasPermission(permissions.viewRoute),
    
    // Get all permissions for this resource
    getResourcePermissions: () => getPermissionsByPattern(resource),
    
    // Permission slugs for use in components
    permissionSlugs: permissions,
  };
};
