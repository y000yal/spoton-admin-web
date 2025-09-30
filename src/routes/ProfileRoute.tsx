import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserDetailPage } from '../pages/users';

const ProfileRoute: React.FC = () => {
  const { user } = useAuth();
  
  // If user is not available, redirect to dashboard
  if (!user?.id) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show the current user's profile
  return <UserDetailPage />;
};

export default ProfileRoute;
