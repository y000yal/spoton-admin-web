import React, { type ReactNode } from 'react';
import { useDynamicPermissions } from '../hooks/useDynamicPermissions';

interface DynamicPermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * A component that conditionally renders children based on dynamic permissions
 * Works with any permission slug without hardcoding
 */
const DynamicPermissionGate: React.FC<DynamicPermissionGateProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useDynamicPermissions();

  // Check permissions
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default DynamicPermissionGate;
