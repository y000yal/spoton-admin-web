import type { User, Permission } from '../types';
import { 
  hasPermission as dynamicHasPermission,
  hasAnyPermission as dynamicHasAnyPermission,
  hasAllPermissions as dynamicHasAllPermissions
} from './dynamicPermissions';

// Navigation item types
export interface NavigationItem {
  name: string;
  href: string;
  permission: string;
  type?: 'single' | 'dropdown';
  children?: NavigationChild[];
}

export interface NavigationChild {
  name: string;
  href: string;
  permission: string;
}

// Note: PERMISSIONS constant has been removed and replaced with dynamic permissions
// Use useDynamicPermissionsConstants() hook to get permissions from API

// Note: ROUTE_PERMISSIONS constant has been removed and replaced with dynamic permissions
// Use useDynamicRoutePermissions() hook to get route permissions from API

// Note: NAVIGATION_ITEMS constant has been removed and replaced with dynamic permissions
// Use useDynamicNavigationItems() hook to get navigation items from API

/**
 * Check if user has a specific permission
 * Uses dynamic permission checking as fallback
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  return dynamicHasPermission(user, permission);
};

/**
 * Check if user has any of the specified permissions
 * Uses dynamic permission checking as fallback
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  return dynamicHasAnyPermission(user, permissions);
};

/**
 * Check if user has all of the specified permissions
 * Uses dynamic permission checking as fallback
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  return dynamicHasAllPermissions(user, permissions);
};

/**
 * Get user's permissions as an array of slugs
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user || !user.role || !user.role.permissions) {
    return [];
  }
  
  return user.role.permissions.map((perm: Permission) => perm.slug);
};

/**
 * Check if user can access a specific route
 * Note: This function now requires route permissions to be passed as parameter
 * Use useDynamicRoutePermissions() hook to get route permissions from API
 */
export const canAccessRoute = (user: User | null, route: string, routePermissions?: Record<string, string[]>) => {
  if (!routePermissions) {
    // If no route permissions provided, use dynamic permission checking as fallback
    return dynamicHasPermission(user, route);
  }
  
  // Handle dynamic routes by converting them to a pattern
  const normalizedRoute = route.replace(/\/\d+/g, '/:id').replace(/\/[^/]+$/g, '/:id');
  
  const requiredPermissions = routePermissions[route] || routePermissions[normalizedRoute];
  
  if (!requiredPermissions) {
    // If no permissions defined for route, allow access (for backward compatibility)
    return true;
  }
  
  return hasAnyPermission(user, [...requiredPermissions]);
};

/**
 * Filter navigation items based on user permissions
 * Note: This function now requires navigation items to be passed as parameter
 * Use useDynamicNavigationItems() hook to get navigation items from API
 */
export const getFilteredNavigationItems = (user: User | null, navigationItems: NavigationItem[]) => {
  return navigationItems
    .filter(item => hasPermission(user, item.permission))
    .map(item => {
      if (item.type === 'dropdown' && item.children) {
        return {
          ...item,
          children: item.children.filter(child => hasPermission(user, child.permission))
        };
      }
      return item;
    })
    .filter(item => {
      // If it's a dropdown with no visible children, hide the parent too
      if (item.type === 'dropdown' && item.children) {
        return item.children.length > 0;
      }
      return true;
    });
};

/**
 * Check if user can perform a specific action on a resource
 */
export const canPerformAction = (user: User | null, resource: string, action: string): boolean => {
  const permission = `${resource}.${action}`;
  return hasPermission(user, permission);
};
