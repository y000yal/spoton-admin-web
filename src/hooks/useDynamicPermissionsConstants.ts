import { useMemo } from 'react';
import { usePermissionsContext } from '../contexts/PermissionsContext';
import type { Permission } from '../types';

/**
 * Hook that generates dynamic permissions constants from the API
 * This replaces the hardcoded PERMISSIONS constant
 */
export const useDynamicPermissionsConstants = () => {
  const { permissions } = usePermissionsContext();

  const dynamicPermissions = useMemo(() => {
    if (!permissions || permissions.length === 0) {
      return {};
    }

    // Create a permissions object dynamically from the API data
    const permissionsObj: Record<string, string> = {};

    permissions.forEach((permission: Permission) => {
      const slug = permission.slug;
      
      // Generate constant names based on permission slug patterns
      const constantName = generateConstantName(slug);
      permissionsObj[constantName] = slug;
    });

    return permissionsObj;
  }, [permissions]);

  return dynamicPermissions;
};

/**
 * Generate a constant name from permission slug and name
 * e.g., 'user-index' -> 'USERS_VIEW', 'user-store' -> 'USERS_CREATE'
 */
const generateConstantName = (slug: string): string => {
  const [resource, action] = slug.split('-');
  
  // Handle special cases
  if (resource === 'dashboard') {
    return action === 'index' ? 'DASHBOARD_VIEW' : 'DASHBOARD_VIEW_ROUTE';
  }
  
  // Convert resource to plural and uppercase
  const resourcePlural = resource.endsWith('s') ? resource.toUpperCase() : `${resource}s`.toUpperCase();
  
  // Map actions to constant suffixes
  const actionMap: Record<string, string> = {
    'index': 'VIEW',
    'show': 'SHOW',
    'store': 'CREATE',
    'update': 'EDIT',
    'destroy': 'DELETE',
    'view': 'VIEW_ROUTE',
    'getpermissions': 'GET_PERMISSIONS',
    'syncpermissions': 'SYNC_PERMISSIONS',
  };
  
  const actionSuffix = actionMap[action] || action.toUpperCase();
  
  return `${resourcePlural}_${actionSuffix}`;
};

/**
 * Hook that generates dynamic route permissions mapping from the API
 */
export const useDynamicRoutePermissions = () => {
  const dynamicPermissions = useDynamicPermissionsConstants();

  return useMemo(() => {
    return {
      '/dashboard': [dynamicPermissions.DASHBOARD_VIEW_ROUTE || 'dashboard-view'],
      '/users': [dynamicPermissions.USERS_VIEW_ROUTE || 'user-view'],
      '/users/create': [dynamicPermissions.USERS_CREATE || 'user-store'],
      '/users/:userId': [dynamicPermissions.USERS_SHOW || 'user-show'],
      '/users/:userId/edit': [dynamicPermissions.USERS_EDIT || 'user-update'],
      '/roles': [dynamicPermissions.ROLES_VIEW_ROUTE || 'role-view'],
      '/roles/create': [dynamicPermissions.ROLES_CREATE || 'role-store'],
      '/roles/:roleId/edit': [dynamicPermissions.ROLES_EDIT || 'role-update'],
      '/permissions': [dynamicPermissions.PERMISSIONS_VIEW_ROUTE || 'permission-view'],
      '/permissions/:permissionId/edit': [dynamicPermissions.PERMISSIONS_EDIT || 'permission-update'],
      '/sports': [dynamicPermissions.SPORTS_VIEW_ROUTE || 'sport-view'],
      '/sports/create': [dynamicPermissions.SPORTS_CREATE || 'sport-store'],
      '/sports/:sportId': [dynamicPermissions.SPORTS_SHOW || 'sport-show'],
      '/sports/:sportId/edit': [dynamicPermissions.SPORTS_EDIT || 'sport-update'],
      '/centers': [dynamicPermissions.CENTERS_VIEW_ROUTE || 'center-view'],
      '/centers/create': [dynamicPermissions.CENTERS_CREATE || 'center-store'],
      '/centers/:centerId': [dynamicPermissions.CENTERS_SHOW || 'center-show'],
      '/centers/:centerId/edit': [dynamicPermissions.CENTERS_EDIT || 'center-update'],
      '/areas': [dynamicPermissions.AREAS_VIEW_ROUTE || 'area-view'],
      '/centers/:centerId/areas': [dynamicPermissions.AREAS_VIEW || 'area-index'],
      '/centers/:centerId/areas/create': [dynamicPermissions.AREAS_CREATE || 'area-store'],
      '/centers/:centerId/areas/:areaId': [dynamicPermissions.AREAS_SHOW || 'area-show'],
      '/centers/:centerId/areas/:areaId/edit': [dynamicPermissions.AREAS_EDIT || 'area-update'],
      '/media': [dynamicPermissions.MEDIA_VIEW_ROUTE || 'media-view'],
      '/media/create': [dynamicPermissions.MEDIA_CREATE || 'media-store'],
    };
  }, [dynamicPermissions]);
};

/**
 * Hook that generates dynamic navigation items from the API
 */
export const useDynamicNavigationItems = () => {
  const dynamicPermissions = useDynamicPermissionsConstants();

  return useMemo(() => {
    return [
      {
        name: 'Dashboard',
        href: '/dashboard',
        permission: dynamicPermissions.DASHBOARD_VIEW_ROUTE || 'dashboard-view',
      },
      {
        name: 'User Management',
        href: '/users',
        permission: dynamicPermissions.USERS_VIEW_ROUTE || 'user-view',
        type: 'dropdown' as const,
        children: [
          {
            name: 'Users',
            href: '/users',
            permission: dynamicPermissions.USERS_VIEW_ROUTE || 'user-view',
          },
          {
            name: 'Roles',
            href: '/roles',
            permission: dynamicPermissions.ROLES_VIEW_ROUTE || 'role-view',
          },
          {
            name: 'Permissions',
            href: '/permissions',
            permission: dynamicPermissions.PERMISSIONS_VIEW_ROUTE || 'permission-view',
          },
        ],
      },
      {
        name: 'Sports',
        href: '/sports',
        permission: dynamicPermissions.SPORTS_VIEW_ROUTE || 'sport-view',
      },
      {
        name: 'Centers',
        href: '/centers',
        permission: dynamicPermissions.CENTERS_VIEW_ROUTE || 'center-view',
      },
      {
        name: 'Media',
        href: '/media',
        permission: dynamicPermissions.MEDIA_VIEW_ROUTE || 'media-view',
      },
    ];
  }, [dynamicPermissions]);
};
