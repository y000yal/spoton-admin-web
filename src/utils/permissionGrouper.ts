import type { Permission } from '../types';

// Define permission categories based on the slug patterns
export interface PermissionGroup {
  name: string;
  description: string;
  icon: string;
  permissions: Permission[];
}

/**
 * Groups permissions by category for better organization and readability
 * Completely dynamic based on backend data - no hardcoded categories
 */
export const groupPermissionsByCategory = (permissions: Permission[]): PermissionGroup[] => {
  const groups: { [key: string]: PermissionGroup } = {};

  permissions.forEach(permission => {
    // Extract category from permission data - use display_name or name as category
    const categoryName = getCategoryFromPermission(permission);
    const categoryIcon = getIconForCategory(categoryName);

    // Initialize group if it doesn't exist
    if (!groups[categoryName]) {
      groups[categoryName] = {
        name: categoryName,
        description: '', // Will be populated dynamically
        icon: categoryIcon,
        permissions: []
      };
    }

    // Add permission to the group
    groups[categoryName].permissions.push(permission);
  });

  // Generate dynamic descriptions based on the permissions in each group
  Object.values(groups).forEach(group => {
    if (group.permissions.length > 0) {
      // Get unique descriptions from permissions in this group
      const descriptions = group.permissions
        .map(p => p.description)
        .filter(desc => desc && desc.trim().length > 0)
        .filter((desc, index, arr) => arr.indexOf(desc) === index); // Remove duplicates
      
      if (descriptions.length > 0) {
        // Use the first description as the group description, or combine them
        if (descriptions.length === 1) {
          group.description = descriptions[0];
        } else {
          // If multiple different descriptions, create a summary
          const firstDesc = descriptions[0];
          const commonWords = firstDesc.split(' ').slice(0, 3).join(' '); // First 3 words
          group.description = `${commonWords} and related operations`;
        }
      } else {
        // Generate description from permission names
        group.description = generateDescriptionFromPermissions(group.permissions);
      }
    }
  });

  // Convert to array and sort by name
  const sortedGroups = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

  // Sort permissions within each group by display name
  sortedGroups.forEach(group => {
    group.permissions.sort((a, b) => {
      const nameA = (a.display_name || a.name || '').toLowerCase();
      const nameB = (b.display_name || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  });

    return sortedGroups;
};

/**
 * Extract category name from permission data dynamically
 */
const getCategoryFromPermission = (permission: Permission): string => {
  // Try to extract category from display_name or name
  const displayName = permission.display_name || permission.name || '';
  
  // If display_name contains common patterns, extract the category
  if (displayName.toLowerCase().includes('user')) {
    return 'User Management';
  } else if (displayName.toLowerCase().includes('role')) {
    return 'Role Management';
  } else if (displayName.toLowerCase().includes('permission')) {
    return 'Permission Management';
  } else if (displayName.toLowerCase().includes('dashboard')) {
    return 'Dashboard';
  } else if (displayName.toLowerCase().includes('system') || displayName.toLowerCase().includes('admin')) {
    return 'System Administration';
  } else if (displayName.toLowerCase().includes('content') || displayName.toLowerCase().includes('post') || displayName.toLowerCase().includes('article')) {
    return 'Content Management';
  } else if (displayName.toLowerCase().includes('report') || displayName.toLowerCase().includes('analytics')) {
    return 'Reports & Analytics';
  } else if (displayName.toLowerCase().includes('settings') || displayName.toLowerCase().includes('config')) {
    return 'Settings & Configuration';
  }
  
  // Fallback: extract from slug if available
  const slug = permission.slug as string;
  if (slug) {
    const resource = slug.split('-')[0];
    return resource.charAt(0).toUpperCase() + resource.slice(1) + ' Management';
  }
  
  // Final fallback: use the permission name itself
  return displayName || 'Other Permissions';
};

/**
 * Get appropriate icon for category
 */
const getIconForCategory = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'User Management': '👥',
    'Role Management': '🛡️',
    'Permission Management': '🔑',
    'Dashboard': '📊',
    'System Administration': '⚙️',
    'Content Management': '📝',
    'Reports & Analytics': '📈',
    'Settings & Configuration': '⚙️',
    'Sport Management': '🏆',
    'Sports Management': '🏆',
    'Country Management': '🌍',
    'Media Management': '📷',
  };
  
  // Check for partial matches
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('user')) return '👥';
  if (lowerName.includes('role')) return '🛡️';
  if (lowerName.includes('permission')) return '🔑';
  if (lowerName.includes('dashboard')) return '📊';
  if (lowerName.includes('system') || lowerName.includes('admin')) return '⚙️';
  if (lowerName.includes('content') || lowerName.includes('post') || lowerName.includes('article')) return '📝';
  if (lowerName.includes('report') || lowerName.includes('analytics')) return '📈';
  if (lowerName.includes('settings') || lowerName.includes('config')) return '⚙️';
  if (lowerName.includes('sport')) return '🏆';
  if (lowerName.includes('country')) return '🌍';
  if (lowerName.includes('media')) return '📷';
  
  return iconMap[categoryName] || '🔧';
};

/**
 * Generate description from permission names when no descriptions are available
 */
const generateDescriptionFromPermissions = (permissions: Permission[]): string => {
  if (permissions.length === 0) return 'No permissions available';
  
  const names = permissions.map(p => p.display_name || p.name || '').filter(name => name.length > 0);
  
  if (names.length === 0) return 'Permissions for this category';
  
  // Get the first permission name and create a description
  const firstName = names[0];
  const words = firstName.split(' ');
  
  if (words.length >= 2) {
    return `${words.slice(0, 2).join(' ')} and related operations`;
  } else {
    return `${firstName} and related operations`;
  }
};


/**
 * Get a human-readable action name from permission slug
 * Dynamic based on common patterns, with fallback to slug parsing
 */
export const getActionName = (slug: string): string => {
  const actionMap: { [key: string]: string } = {
    'index': 'View List',
    'show': 'View Details',
    'store': 'Create',
    'create': 'Create',
    'update': 'Edit',
    'edit': 'Edit',
    'destroy': 'Delete',
    'delete': 'Delete',
    'getpermissions': 'Get Permissions',
    'syncpermissions': 'Sync Permissions',
    'assign': 'Assign',
    'revoke': 'Revoke',
    'export': 'Export',
    'import': 'Import',
    'approve': 'Approve',
    'reject': 'Reject',
    'activate': 'Activate',
    'deactivate': 'Deactivate',
    'restore': 'Restore',
    'archive': 'Archive',
    'publish': 'Publish',
    'unpublish': 'Unpublish',
  };

  // Extract action from slug (usually the last part after the last dash)
  const parts = slug.split('-');
  const action = parts[parts.length - 1];
  
  return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);
};

/**
 * Get a human-readable resource name from permission slug
 * Dynamic based on common patterns, with fallback to slug parsing
 */
export const getResourceName = (slug: string): string => {
  const resourceMap: { [key: string]: string } = {
    'user': 'Users',
    'users': 'Users',
    'role': 'Roles',
    'roles': 'Roles',
    'permission': 'Permissions',
    'permissions': 'Permissions',
    'dashboard': 'Dashboard',
    'system': 'System',
    'admin': 'Administration',
    'content': 'Content',
    'post': 'Posts',
    'article': 'Articles',
    'report': 'Reports',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'config': 'Configuration',
  };

  // Extract resource from slug (usually the first part before the first dash)
  const parts = slug.split('-');
  const resource = parts[0];
  
  return resourceMap[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
};
