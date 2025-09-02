import { useAuth } from './useAuth';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canAccessRoute, 
  canPerformAction,
  getUserPermissions 
} from '../utils/permissions';

/**
 * Custom hook for permission checking
 * Provides easy access to permission utilities with current user context
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    // Check if user has a specific permission
    hasPermission: (permission: string) => hasPermission(user, permission),
    
    // Check if user has any of the specified permissions
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    
    // Check if user has all of the specified permissions
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    
    // Check if user can access a specific route
    canAccessRoute: (route: string) => canAccessRoute(user, route),
    
    // Check if user can perform a specific action on a resource
    canPerformAction: (resource: string, action: string) => canPerformAction(user, resource, action),
    
    // Get all user permissions
    getUserPermissions: () => getUserPermissions(user),
    
    // Get current user
    user,
  };
};
