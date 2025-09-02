import type { User, Permission } from '../types';

// Permission constants - these match your backend permission slugs
export const PERMISSIONS = {
  // Dashboard permissions (assuming you'll add these)
  DASHBOARD_VIEW: 'dashboard-index',
  
  // User management permissions
  USERS_VIEW: 'user-index',
  USERS_CREATE: 'user-store',
  USERS_EDIT: 'user-update',
  USERS_DELETE: 'user-destroy',
  USERS_SHOW: 'user-show',
  
  // Role management permissions
  ROLES_VIEW: 'roles-index',
  ROLES_CREATE: 'roles-store',
  ROLES_EDIT: 'roles-update',
  ROLES_DELETE: 'roles-destroy',
  ROLES_SHOW: 'roles-show',
  ROLES_GET_PERMISSIONS: 'roles-getpermissions',
  ROLES_SYNC_PERMISSIONS: 'roles-syncpermissions',
  
  // Permission management permissions
  PERMISSIONS_VIEW: 'permissions-index',
  PERMISSIONS_CREATE: 'permissions-store',
  PERMISSIONS_EDIT: 'permissions-update',
  PERMISSIONS_DELETE: 'permissions-destroy',
  PERMISSIONS_SHOW: 'permissions-show',
} as const;

// Route to permission mapping
export const ROUTE_PERMISSIONS = {
  '/dashboard': [PERMISSIONS.DASHBOARD_VIEW],
  '/users': [PERMISSIONS.USERS_VIEW],
  '/users/create': [PERMISSIONS.USERS_CREATE],
  '/users/:userId': [PERMISSIONS.USERS_SHOW],
  '/users/:userId/edit': [PERMISSIONS.USERS_EDIT],
  '/roles': [PERMISSIONS.ROLES_VIEW],
  '/roles/create': [PERMISSIONS.ROLES_CREATE],
  '/roles/:roleId/edit': [PERMISSIONS.ROLES_EDIT],
  '/permissions': [PERMISSIONS.PERMISSIONS_VIEW],
  '/permissions/:permissionId/edit': [PERMISSIONS.PERMISSIONS_EDIT],
} as const;

// Navigation items with their required permissions
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    name: 'Users',
    href: '/users',
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    name: 'Roles',
    href: '/roles',
    permission: PERMISSIONS.ROLES_VIEW,
  },
  {
    name: 'Permissions',
    href: '/permissions',
    permission: PERMISSIONS.PERMISSIONS_VIEW,
  },
] as const;

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
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
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }
  
  return permissions.every(permission => hasPermission(user, permission));
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
 */
export const canAccessRoute = (user: User | null, route: string): boolean => {
  // Handle dynamic routes by converting them to a pattern
  const normalizedRoute = route.replace(/\/\d+/g, '/:id').replace(/\/[^/]+$/g, '/:id');
  
  const requiredPermissions = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS] ||
                             ROUTE_PERMISSIONS[normalizedRoute as keyof typeof ROUTE_PERMISSIONS];
  
  if (!requiredPermissions) {
    // If no permissions defined for route, allow access (for backward compatibility)
    return true;
  }
  
  return hasAnyPermission(user, [...requiredPermissions]);
};

/**
 * Filter navigation items based on user permissions
 */
export const getFilteredNavigationItems = (user: User | null) => {
  return NAVIGATION_ITEMS.filter(item => hasPermission(user, item.permission));
};

/**
 * Check if user can perform a specific action on a resource
 */
export const canPerformAction = (user: User | null, resource: string, action: string): boolean => {
  const permission = `${resource}.${action}`;
  return hasPermission(user, permission);
};
