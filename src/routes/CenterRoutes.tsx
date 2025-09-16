import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CentersPage, CenterCreatePage, CenterEditPage, CenterDetailPage } from '../pages/centers';
import ProtectedRoute from '../components/ProtectedRoute';

const CenterRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['center-index']}>
          <CentersPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['center-store']}>
          <CenterCreatePage />
        </ProtectedRoute>
      } />
      <Route path=":centerId" element={
        <ProtectedRoute requiredPermissions={['center-show']}>
          <CenterDetailPage />
        </ProtectedRoute>
      } />
      <Route path=":centerId/edit" element={
        <ProtectedRoute requiredPermissions={['center-update']}>
          <CenterEditPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default CenterRoutes;
