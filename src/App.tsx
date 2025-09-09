import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { UsersPage, UserDetailPage, UserEditPage, UserCreatePage } from './pages/users';
import { RolesPage, RoleEditPage, RoleCreatePage, RoleDetailPage } from './pages/roles';
import { PermissionsPage, PermissionCreatePage, PermissionEditPage, PermissionDetailPage } from './pages/permissions';
import { SportsPage, SportCreatePage, SportEditPage, SportDetailPage } from './pages/sports';
import { CentersPage, CenterCreatePage, CenterEditPage, CenterDetailPage } from './pages/centers';
import { AreasPage, AreaCreatePage, AreaEditPage, AreaDetailPage } from './pages/areas';
import { MediaPage, MediaCreatePage } from './pages/media';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { PERMISSIONS } from './utils/permissions';

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

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<AuthGuard />}>
                <Route element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard Route */}
                  <Route path="dashboard" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* User Routes */}
                  <Route path="users" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                      <UsersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="users/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_CREATE]}>
                      <UserCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="users/:userId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_SHOW]}>
                      <UserDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="users/:userId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_EDIT]}>
                      <UserEditPage />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_SHOW]}>
                      <UserDetailPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Role Routes */}
                  <Route path="roles" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.ROLES_VIEW]}>
                      <RolesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="roles/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.ROLES_CREATE]}>
                      <RoleCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="roles/:roleId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.ROLES_SHOW]}>
                      <RoleDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="roles/:roleId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.ROLES_EDIT]}>
                      <RoleEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Permission Routes */}
                  <Route path="permissions" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.PERMISSIONS_VIEW]}>
                      <PermissionsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="permissions/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.PERMISSIONS_CREATE]}>
                      <PermissionCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="permissions/:permissionId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.PERMISSIONS_SHOW]}>
                      <PermissionDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="permissions/:permissionId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.PERMISSIONS_EDIT]}>
                      <PermissionEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Sports Routes */}
                  <Route path="sports" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.SPORTS_VIEW]}>
                      <SportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="sports/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.SPORTS_CREATE]}>
                      <SportCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="sports/:sportId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.SPORTS_SHOW]}>
                      <SportDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="sports/:sportId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.SPORTS_EDIT]}>
                      <SportEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Centers Routes */}
                  <Route path="centers" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.CENTERS_VIEW]}>
                      <CentersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.CENTERS_CREATE]}>
                      <CenterCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/:centerId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.CENTERS_SHOW]}>
                      <CenterDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/:centerId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.CENTERS_EDIT]}>
                      <CenterEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Areas Routes */}
                  <Route path="centers/:centerId/areas" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_VIEW]}>
                      <AreasPage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/:centerId/areas/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_CREATE]}>
                      <AreaCreatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/:centerId/areas/:areaId" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_SHOW]}>
                      <AreaDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="centers/:centerId/areas/:areaId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_EDIT]}>
                      <AreaEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Media Routes */}
                  <Route path="media" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.MEDIA_VIEW]}>
                      <MediaPage />
                    </ProtectedRoute>
                  } />
                  <Route path="media/create" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.MEDIA_CREATE]}>
                      <MediaCreatePage />
                    </ProtectedRoute>
                  } />
                </Route>
              </Route>
              
              {/* General Areas Routes */}
              <Route path="areas" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_VIEW]}>
                  <AreasPage />
                </ProtectedRoute>
              } />
              <Route path="areas/create" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.AREAS_CREATE]}>
                  <AreaCreatePage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
