import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDynamicPermissions } from '../hooks/useDynamicPermissions';
import { hasAnyPermission, canAccessRoute } from '../utils/dynamicPermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that checks user permissions before rendering children
 * If user doesn't have required permissions, redirects to fallback path or dashboard
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [], 
  fallbackPath = '/dashboard' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isLoading: permissionsLoading } = useDynamicPermissions();
  const location = useLocation();

  // Redirect to login if not authenticated (check this first)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading state while checking permissions (only if authenticated)
  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user can access the current route using dynamic permissions
  const canAccess = canAccessRoute(user, location.pathname);
  // Check specific required permissions if provided
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    hasAnyPermission(user, requiredPermissions);


  // If user doesn't have required permissions, redirect to fallback
  if (!canAccess || !hasRequiredPermissions) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
