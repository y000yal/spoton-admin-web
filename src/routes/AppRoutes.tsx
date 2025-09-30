import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoutes from './PublicRoutes';
import DashboardRoutes from './DashboardRoutes';
import UserRoutes from './UserRoutes';
import ProfileRoute from './ProfileRoute';
import RoleRoutes from './RoleRoutes';
import PermissionRoutes from './PermissionRoutes';
import SportRoutes from './SportRoutes';
import CenterRoutes from './CenterRoutes';
import AreaRoutes from './AreaRoutes';
import MediaRoutes from './MediaRoutes';

// Authentication Guard Component
const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Main Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoutes />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<AuthGuard />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredPermissions={['dashboard-index', 'dashboard-view']}>
              <DashboardRoutes />
            </ProtectedRoute>
          } />
          
          {/* User Routes */}
          <Route path="users/*" element={
            <ProtectedRoute requiredPermissions={['user-index', 'user-view']}>
              <UserRoutes />
            </ProtectedRoute>
          } />
          
          {/* Profile Route - Direct route for current user's profile */}
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfileRoute />
            </ProtectedRoute>
          } />
          
          {/* Role Routes */}
          <Route path="roles/*" element={
            <ProtectedRoute requiredPermissions={['role-index', 'role-view']}>
              <RoleRoutes />
            </ProtectedRoute>
          } />
          
          {/* Permission Routes */}
          <Route path="permissions/*" element={
            <ProtectedRoute requiredPermissions={['permission-index', 'permission-view']}>
              <PermissionRoutes />
            </ProtectedRoute>
          } />
          
          {/* Sports Routes */}
          <Route path="sports/*" element={
            <ProtectedRoute requiredPermissions={['sport-index', 'sport-view']}>
              <SportRoutes />
            </ProtectedRoute>
          } />
          
          {/* Centers Routes */}
          <Route path="centers/*" element={
            <ProtectedRoute requiredPermissions={['center-index', 'center-view']}>
              <CenterRoutes />
            </ProtectedRoute>
          } />
          
          {/* Areas Routes */}
          <Route path="centers/:centerId/areas/*" element={
            <ProtectedRoute requiredPermissions={['area-index']}>
              <AreaRoutes />
            </ProtectedRoute>
          } />
          
          {/* Media Routes */}
          <Route path="media/*" element={
            <ProtectedRoute requiredPermissions={['media-index', 'media-view']}>
              <MediaRoutes />
            </ProtectedRoute>
          } />
        </Route>
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
