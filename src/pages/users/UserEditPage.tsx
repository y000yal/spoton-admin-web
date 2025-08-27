import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser, fetchUser } from '../../store/slices/userSlice';
import { fetchRoles } from '../../store/slices/roleSlice';

import { Card, Button, InputField, SelectField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, User as UserIcon, Save, X } from 'lucide-react';
import type { User, UpdateUserRequest } from '../../types';

const UserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentUser, isLoading } = useAppSelector(state => state.users);
  const { roles } = useAppSelector(state => state.roles);

  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: '',
    email: '',
    full_name: {
      first_name: '',
      middle_name: '',
      last_name: ''
    },
    role_id: undefined,
    status: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(parseInt(userId)));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        full_name: {
          first_name: currentUser.full_name?.split(' ')[0] || '',
          middle_name: currentUser.full_name?.split(' ').slice(1, -1).join(' ') || '',
          last_name: currentUser.full_name?.split(' ').slice(-1)[0] || ''
        },
        role_id: currentUser.role?.id,
        status: parseInt(currentUser.status)
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!roles) {
      dispatch(fetchRoles({ page: 1, limit: 100 }));
    }
  }, [roles, dispatch]);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UpdateUserRequest] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Keep full_name as object structure for API
      const apiData: UpdateUserRequest = {
        role_id: formData.role_id,
        email: formData.email,
        username: formData.username,
        status: formData.status,
        full_name: {
          first_name: formData.full_name?.first_name || '',
          middle_name: formData.full_name?.middle_name || '',
          last_name: formData.full_name?.last_name || ''
        }
      };

      await dispatch(updateUser({ userId: parseInt(userId), userData: apiData })).unwrap();
      navigate(`/users/${userId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Button onClick={handleCancel} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleCancel}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">
              Update information for {currentUser.full_name || currentUser.username}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="First Name"
                name="first_name"
                value={formData.full_name?.first_name || ''}
                onChange={(e) => handleInputChange('full_name.first_name', e.target.value)}
                placeholder="First name"
                required
              />
              <InputField
                label="Middle Name"
                name="middle_name"
                value={formData.full_name?.middle_name || ''}
                onChange={(e) => handleInputChange('full_name.middle_name', e.target.value)}
                placeholder="Middle name (optional)"
              />
              <InputField
                label="Last Name"
                name="last_name"
                value={formData.full_name?.last_name || ''}
                onChange={(e) => handleInputChange('full_name.last_name', e.target.value)}
                placeholder="Last name"
                required
              />
            </div>
            
            <InputField
              label="Username"
              name="username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Username"
              required
            />
            
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email address"
              required
            />
          </FormSection>

          <FormSection title="Account Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Role"
                name="role_id"
                value={formData.role_id?.toString() || ''}
                onChange={(e) => handleInputChange('role_id', parseInt(e.target.value))}
                options={[
                  { value: '', label: 'Select a role' },
                  ...(roles?.data?.map(role => ({
                    value: role.id.toString(),
                    label: role.display_name || role.name
                  })) || [])
                ]}
                required
              />
              
              <SelectField
                label="Status"
                name="status"
                value={formData.status?.toString() || ''}
                onChange={(e) => handleInputChange('status', parseInt(e.target.value))}
                options={[
                  { value: '', label: 'Select status' },
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' },
                  { value: '2', label: 'Email Pending' }
                ]}
                required
              />
            </div>
          </FormSection>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <X className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              leftIcon={isSubmitting ? undefined : <Save className="h-4 w-4" />}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
};

export default UserEditPage;
