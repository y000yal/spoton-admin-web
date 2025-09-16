import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UsersPage, UserDetailPage, UserEditPage, UserCreatePage } from '../pages/users';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

const UserRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['user-index']}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['user-store']}>
          <UserCreatePage />
        </ProtectedRoute>
      } />
      <Route path="profile" element={
        user?.id ? <UserDetailPage /> : <Navigate to="/dashboard" replace />
      } />
      <Route path=":userId" element={
        <ProtectedRoute requiredPermissions={['user-show']}>
          <UserDetailPage />
        </ProtectedRoute>
      } />
      <Route path=":userId/edit" element={
        <ProtectedRoute requiredPermissions={['user-update']}>
          <UserEditPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default UserRoutes;