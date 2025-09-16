import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PermissionsPage, PermissionCreatePage, PermissionEditPage, PermissionDetailPage } from '../pages/permissions';
import ProtectedRoute from '../components/ProtectedRoute';

const PermissionRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['permission-index']}>
          <PermissionsPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['permission-store']}>
          <PermissionCreatePage />
        </ProtectedRoute>
      } />
      <Route path=":permissionId" element={
        <ProtectedRoute requiredPermissions={['permission-show']}>
          <PermissionDetailPage />
        </ProtectedRoute>
      } />
      <Route path=":permissionId/edit" element={
        <ProtectedRoute requiredPermissions={['permission-update']}>
          <PermissionEditPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default PermissionRoutes;
