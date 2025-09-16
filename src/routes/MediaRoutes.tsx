import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MediaPage, MediaCreatePage } from '../pages/media';
import ProtectedRoute from '../components/ProtectedRoute';

const MediaRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={
        <ProtectedRoute requiredPermissions={['media-index']}>
          <MediaPage />
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredPermissions={['media-store']}>
          <MediaCreatePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default MediaRoutes;
