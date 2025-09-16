import React from 'react';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/ProtectedRoute';

const DashboardRoutes: React.FC = () => {
  return (
    <ProtectedRoute requiredPermissions={['dashboard-view']}>
      <DashboardPage />
    </ProtectedRoute>
  );
};

export default DashboardRoutes;
