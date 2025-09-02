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
import { RolesPage, RoleEditPage, RoleCreatePage } from './pages/roles';
import { PermissionsPage, PermissionCreatePage, PermissionEditPage } from './pages/permissions';
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
                  <Route path="permissions/:permissionId/edit" element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.PERMISSIONS_EDIT]}>
                      <PermissionEditPage />
                    </ProtectedRoute>
                  } />
                </Route>
              </Route>
              
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
