import { useAuth } from './useAuth';
import type { Permission } from '../types';

/**
 * Hook for checking user permissions
 * This hook provides functions to check if the current user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    
    return user.role.permissions.some((perm: Permission) => 
      perm.slug === permission
    );
  };
  
  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissions.some(permission => hasPermission(permission));
  };
  
  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissions.every(permission => hasPermission(permission));
  };
  
  /**
   * Get user's permissions as an array of slugs
   */
  const getUserPermissions = (): string[] => {
    if (!user || !user.role || !user.role.permissions) {
      return [];
    }
    
    return user.role.permissions.map((perm: Permission) => perm.slug);
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions: getUserPermissions(),
  };
};
