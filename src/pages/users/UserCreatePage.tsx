import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

import { Card, Button, InputField, SelectField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import type { CreateUserRequest } from '../../types';

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // React Query hooks
  const createUserMutation = useCreateUser();
  const { data: rolesData } = useRoles({ page: 1, limit: 100 });
  const roles = rolesData?.data || [];
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: {
      first_name: '',
      middle_name: '',
      last_name: ''
    },
    role_id: 1,
    address: '',
    mobile_no: 0
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateUserRequest] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setFieldErrors({});

    try {
      const response = await createUserMutation.mutateAsync(formData);
      
      // Show success message from API response
      showSuccess(
        response.message || 'User created successfully!',
        'User Created'
      );
      
      // Invalidate and refetch the users list data to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Wait for the invalidation to complete and data to be refetched
      await queryClient.refetchQueries({ queryKey: ["users"] });
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: unknown } };
        if (axiosError.response?.status === 422) {
          const errorData = axiosError.response.data as { message?: Record<string, unknown> };
          if (errorData?.message && typeof errorData.message === 'object') {
            const newFieldErrors: Record<string, string> = {};
            Object.entries(errorData.message).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                newFieldErrors[field] = messages.join(', ');
              } else {
                newFieldErrors[field] = String(messages);
              }
            });
            setFieldErrors(newFieldErrors);
          } else {
            setError('Validation failed. Please check your input.');
            showError('Validation failed. Please check your input.', 'Validation Error');
          }
        } else {
          setError('Failed to create user');
          showError('Failed to create user', 'Creation Failed');
        }
      } else {
        setError('Failed to create user');
        showError('Failed to create user', 'Creation Failed');
      }
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
            <p className="text-gray-600">Add a new user to the system</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
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
                error={fieldErrors['full_name.first_name'] || fieldErrors['first_name']}
              />
              <InputField
                label="Middle Name"
                name="middle_name"
                value={formData.full_name?.middle_name || ''}
                onChange={(e) => handleInputChange('full_name.middle_name', e.target.value)}
                placeholder="Middle name (optional)"
                error={fieldErrors['full_name.middle_name'] || fieldErrors['middle_name']}
              />
              <InputField
                label="Last Name"
                name="last_name"
                value={formData.full_name?.last_name || ''}
                onChange={(e) => handleInputChange('full_name.last_name', e.target.value)}
                placeholder="Last name"
                required
                error={fieldErrors['full_name.last_name'] || fieldErrors['last_name']}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Username"
                name="username"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Username"
                required
                error={fieldErrors['username']}
              />
              
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email address"
                required
                error={fieldErrors['email']}
              />
            </div>
          </FormSection>

          <FormSection title="Account Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                required
                error={fieldErrors['password']}
              />
              
              <InputField
                label="Confirm Password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password || ''}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                placeholder="Confirm password"
                required
                error={fieldErrors['confirm_password']}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Role"
                name="role_id"
                value={formData.role_id?.toString() || ''}
                onChange={(e) => handleInputChange('role_id', parseInt(e.target.value))}
                options={[
                  { value: '', label: 'Select a role' },
                  ...(roles?.map(role => ({
                    value: role.id.toString(),
                    label: role.display_name || role.name
                  })) || [])
                ]}
                required
                error={fieldErrors['role_id']}
              />
              
              <InputField
                label="Mobile Number"
                name="mobile_no"
                type="tel"
                value={formData.mobile_no || ''}
                onChange={(e) => handleInputChange('mobile_no', parseInt(e.target.value) || 0)}
                placeholder="Mobile number"
                required
                error={fieldErrors['mobile_no']}
              />
            </div>
            
            <InputField
              label="Address"
              name="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address"
              required
              error={fieldErrors['address']}
            />
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
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              leftIcon={createUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
};

export default UserCreatePage;
