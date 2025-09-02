import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canAccessRoute } from '../utils/permissions';

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
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific permissions required, allow access
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check if user can access the current route
  const canAccess = canAccessRoute(user, location.pathname);
  
  // Also check specific required permissions if provided
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => {
      if (!user || !user.role || !user.role.permissions) {
        return false;
      }
      return user.role.permissions.some((perm: any) => perm.slug === permission);
    });

  // If user doesn't have required permissions, redirect to fallback
  if (!canAccess || !hasRequiredPermissions) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
