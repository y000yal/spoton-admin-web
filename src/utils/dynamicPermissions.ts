import type { User, Permission } from '../types';

/**
 * Dynamic permission checker that works with any permission slug
 * without needing to hardcode them in permissions.ts
 */

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
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!permissions.length) return true;
  const userPermissions = getUserPermissions(user);
  
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!permissions.length) return true;
  
  const userPermissions = getUserPermissions(user);
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user can access a specific route based on permission pattern
 * This function can work with dynamic permission slugs
 */
export const canAccessRoute = (user: User | null, route: string, permissionPattern?: string): boolean => {
  // If a specific permission pattern is provided, use it
  if (permissionPattern) {
    return hasPermission(user, permissionPattern);
  }
  
  // Otherwise, try to infer the permission from the route
  // This is a fallback for backward compatibility
  const routePermission = inferPermissionFromRoute(route);
  
  // If routePermission is null (like for profile route), allow access
  if (routePermission === null) {
    return true;
  }
  
  if (routePermission) {
    return hasPermission(user, routePermission);
  }
  
  // If no permission can be inferred, allow access (for backward compatibility)
  return true;
};

/**
 * Infer permission slug from route path
 * This is a helper function for backward compatibility
 */
const inferPermissionFromRoute = (route: string): string | null => {
  // Remove leading slash and split by '/'
  const segments = route.replace(/^\//, '').split('/');
  
  if (segments.length === 0) return null;
  
  const resource = segments[0];
  
  // Handle special cases first
  if (resource === 'dashboard') {
    return 'dashboard-view'; // User has dashboard-view, not dashboard-index
  }
  
  // Handle profile route - users should be able to view their own profile
  if (resource === 'profile') {
    return null; // No permission required for viewing own profile
  }
  
  // Handle edit routes (e.g., /roles/1/edit, /users/1/edit)
  if (segments.length >= 3 && segments[segments.length - 1] === 'edit') {
    const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    return `${singularResource}-update`;
  }
  
  // Handle create routes (e.g., /roles/create, /users/create)
  if (segments.length >= 2 && segments[segments.length - 1] === 'create') {
    const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    return `${singularResource}-store`;
  }
  
  // Handle detail routes (e.g., /roles/1, /users/1)
  if (segments.length === 2 && !isNaN(Number(segments[1]))) {
    const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    return `${singularResource}-show`;
  }
  
  // Handle nested resources (e.g., /centers/:id/areas)
  if (segments.length > 2) {
    const nestedResource = segments[2];
    const singularResource = nestedResource.endsWith('s') ? nestedResource.slice(0, -1) : nestedResource;
    return `${singularResource}-index`; // Default to index for nested resources
  }
  
  // For main routes like /users, /roles, /permissions, etc.
  // Convert plural to singular and add -index suffix
  const singularResource = resource.endsWith('s') ? resource.slice(0, -1) : resource;
  return `${singularResource}-index`;
};

/**
 * Get all permissions that match a pattern
 * Useful for finding permissions related to a specific resource
 */
export const getPermissionsByPattern = (allPermissions: Permission[], pattern: string): Permission[] => {
  return allPermissions.filter(permission => 
    permission.slug.includes(pattern) || 
    permission.name.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * Check if a permission exists in the available permissions
 */
export const permissionExists = (allPermissions: Permission[], permissionSlug: string): boolean => {
  return allPermissions.some(permission => permission.slug === permissionSlug);
};
