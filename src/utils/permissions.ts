import type { User, Permission } from '../types';

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
  
  // Sports management permissions
  SPORTS_VIEW: 'sport-index',
  SPORTS_CREATE: 'sport-store',
  SPORTS_EDIT: 'sport-update',
  SPORTS_DELETE: 'sport-destroy',
  SPORTS_SHOW: 'sport-show',
  
  // Centers management permissions
  CENTERS_VIEW: 'center-index',
  CENTERS_CREATE: 'center-store',
  CENTERS_EDIT: 'center-update',
  CENTERS_DELETE: 'center-destroy',
  CENTERS_SHOW: 'center-show',
  
  // Areas management permissions
  AREAS_VIEW: 'area-index',
  AREAS_CREATE: 'area-store',
  AREAS_EDIT: 'area-update',
  AREAS_DELETE: 'area-destroy',
  AREAS_SHOW: 'area-show',
  
  // Media management permissions
  MEDIA_VIEW: 'media-index',
  MEDIA_CREATE: 'media-store',
  MEDIA_EDIT: 'media-update',
  MEDIA_DELETE: 'media-destroy',
  MEDIA_SHOW: 'media-show',
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
  '/sports': [PERMISSIONS.SPORTS_VIEW],
  '/sports/create': [PERMISSIONS.SPORTS_CREATE],
  '/sports/:sportId': [PERMISSIONS.SPORTS_SHOW],
  '/sports/:sportId/edit': [PERMISSIONS.SPORTS_EDIT],
  '/centers': [PERMISSIONS.CENTERS_VIEW],
  '/centers/create': [PERMISSIONS.CENTERS_CREATE],
  '/centers/:centerId': [PERMISSIONS.CENTERS_SHOW],
  '/centers/:centerId/edit': [PERMISSIONS.CENTERS_EDIT],
  '/centers/:centerId/areas': [PERMISSIONS.AREAS_VIEW],
  '/centers/:centerId/areas/create': [PERMISSIONS.AREAS_CREATE],
  '/centers/:centerId/areas/:areaId': [PERMISSIONS.AREAS_SHOW],
  '/centers/:centerId/areas/:areaId/edit': [PERMISSIONS.AREAS_EDIT],
  '/media': [PERMISSIONS.MEDIA_VIEW],
  '/media/create': [PERMISSIONS.MEDIA_CREATE],
} as const;

// Navigation items with their required permissions
export const NAVIGATION_ITEMS: NavigationItem[] = [
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
  {
    name: 'Sports',
    href: '/sports',
    permission: PERMISSIONS.SPORTS_VIEW,
  },
  {
    name: 'Centers',
    href: '/centers',
    permission: PERMISSIONS.CENTERS_VIEW,
    type: 'dropdown',
    children: [
      {
        name: 'All Centers',
        href: '/centers',
        permission: PERMISSIONS.CENTERS_VIEW,
      },
    ],
  },
  {
    name: 'Media',
    href: '/media',
    permission: PERMISSIONS.MEDIA_VIEW,
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
