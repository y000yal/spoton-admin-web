import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RolesPage, RoleEditPage, RoleCreatePage, RoleDetailPage } from '../pages/roles';
import ProtectedRoute from '../components/ProtectedRoute';

const RoleRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['role-index']}>
          <RolesPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['role-store']}>
          <RoleCreatePage />
        </ProtectedRoute>
      } />
      <Route path=":roleId" element={
        <ProtectedRoute requiredPermissions={['role-show']}>
          <RoleDetailPage />
        </ProtectedRoute>
      } />
      <Route path=":roleId/edit" element={
        <ProtectedRoute requiredPermissions={['role-update']}>
          <RoleEditPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default RoleRoutes;
