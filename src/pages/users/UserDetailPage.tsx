import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import { Card, Button } from '../../components/UI';
import { ArrowLeft, User as UserIcon, Mail, Calendar, Shield, Edit, Eye } from 'lucide-react';
import { userService } from '../../services/api';
import type { User } from '../../types';

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which user to display
  const targetUserId = userId ? parseInt(userId) : currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id?.toString();
  
 

    useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If it's the current user and we have their complete data, use it
        if (isOwnProfile && currentUser && currentUser.role) {
          console.log('Using current user data from auth context:', currentUser);
          setUser(currentUser);
        } else if (targetUserId) {
          // Fetch user data from API
          const response = await userService.getUser(targetUserId);
          
          // The API returns the user object directly
          setUser(response);
        } else {
          setError('No user ID provided and no current user data available');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch user:', err);
        const errorMessage = err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 'data' in err.response &&
          err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
          ? String(err.response.data.message)
          : 'Failed to fetch user details';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleEdit = () => {
    if (user) {
      navigate(`/users/${user.id}/edit`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-6">{error || 'User not found'}</p>
          <Button onClick={handleBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      '1': { label: 'Active', className: 'bg-green-100 text-green-800' },
      '0': { label: 'Inactive', className: 'bg-red-100 text-red-800' },
      '2': { label: 'Email Pending', className: 'bg-yellow-100 text-yellow-800' }
    };

    const statusInfo = statusMap[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOwnProfile ? 'My Profile' : 'User Details'}
            </h1>
            <p className="text-gray-600">
              {isOwnProfile ? 'View and manage your profile information' : `Viewing details for ${user.full_name || user.username}`}
            </p>
          </div>
        </div>
        
        {isOwnProfile && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* User Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.full_name || 'No Name Provided'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    @{user.username || 'No Username'}
                  </p>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(user.status)}
                    {user.role && (
                      <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                        {user.role.display_name || user.role.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Member since</span>
                  <span className="ml-auto font-medium text-gray-900">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                {user.updated_at && user.updated_at !== user.created_at && (
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">Last updated</span>
                    <span className="ml-auto font-medium text-gray-900">
                      {formatDate(user.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 text-primary-600 mr-2" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <p className="text-gray-900">{user.full_name || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <p className="text-gray-900">{user.username || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{user.email || 'Not specified'}</span>
                  {user.email_verified_at && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account & Security */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 text-primary-600 mr-2" />
              Account & Security
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                <p className="text-gray-900 font-mono">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className="flex items-center">
                  {getStatusBadge(user.status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <div className="flex items-center">
                  {user.role ? (
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {user.role.display_name || user.role.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">No role assigned</span>
                  )}
                </div>
              </div>
              {user.role?.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role Description</label>
                  <p className="text-gray-900 text-sm">{user.role.description}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            {user.updated_at && user.updated_at !== user.created_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(user.updated_at)}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {isOwnProfile && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;
