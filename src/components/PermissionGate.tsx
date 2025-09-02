import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate component for conditional rendering based on user permissions
 * 
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @param fallback - Component to render if user doesn't have required permissions
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Determine which permissions to check
  const permissionsToCheck = permission ? [permission, ...permissions] : permissions;

  // Check permissions based on requirements
  let hasRequiredPermissions = false;
  
  if (permissionsToCheck.length === 0) {
    // If no permissions specified, allow access
    hasRequiredPermissions = true;
  } else if (requireAll) {
    // User must have ALL permissions
    hasRequiredPermissions = hasAllPermissions(permissionsToCheck);
  } else {
    // User needs ANY permission
    hasRequiredPermissions = hasAnyPermission(permissionsToCheck);
  }

  return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
