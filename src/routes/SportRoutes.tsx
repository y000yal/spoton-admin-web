import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SportsPage, SportCreatePage, SportEditPage, SportDetailPage } from '../pages/sports';
import ProtectedRoute from '../components/ProtectedRoute';

const SportRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['sport-index']}>
          <SportsPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['sport-store']}>
          <SportCreatePage />
        </ProtectedRoute>
      } />
      <Route path=":sportId" element={
        <ProtectedRoute requiredPermissions={['sport-show']}>
          <SportDetailPage />
        </ProtectedRoute>
      } />
      <Route path=":sportId/edit" element={
        <ProtectedRoute requiredPermissions={['sport-update']}>
          <SportEditPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default SportRoutes;
