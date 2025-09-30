import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';

import { Card, Button, InputField, SelectField, FormSection } from '../../components/UI';
import { ArrowLeft, Save, X, Users } from 'lucide-react';
import type { CreateUserRequest } from '../../types';
import { validateDateOfBirth, validateFieldLength, getValidationMessage } from '../../utils/userValidation';

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
    mobile_no: '',
    date_of_birth: '',
    gender: '',
    country_id: undefined,
    address: '',
    longitude: '',
    latitude: '',
    preferred_sports: '',
    emergency_contact_name: '',
    emergency_contact_no: '',
    emergency_contact_relationship: '',
    terms_and_condition_acceptance: '',
    privacy_policy_acceptance: '',
    role_id: 1
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

    // Client-side validation
    const validationErrors: Record<string, string> = {};

    // Validate date of birth
    if (formData.date_of_birth && !validateDateOfBirth(formData.date_of_birth)) {
      validationErrors.date_of_birth = getValidationMessage('date_of_birth', 'before');
    }

    // Validate field lengths
    if (formData.mobile_no && !validateFieldLength(formData.mobile_no, 20)) {
      validationErrors.mobile_no = getValidationMessage('mobile_no', 'max');
    }

    if (formData.address && !validateFieldLength(formData.address, 500)) {
      validationErrors.address = getValidationMessage('address', 'max');
    }

    if (formData.longitude && !validateFieldLength(formData.longitude, 50)) {
      validationErrors.longitude = getValidationMessage('longitude', 'max');
    }

    if (formData.latitude && !validateFieldLength(formData.latitude, 50)) {
      validationErrors.latitude = getValidationMessage('latitude', 'max');
    }

    if (formData.preferred_sports && !validateFieldLength(formData.preferred_sports, 500)) {
      validationErrors.preferred_sports = getValidationMessage('preferred_sports', 'max');
    }

    if (formData.emergency_contact_name && !validateFieldLength(formData.emergency_contact_name, 255)) {
      validationErrors.emergency_contact_name = getValidationMessage('emergency_contact_name', 'max');
    }

    if (formData.emergency_contact_no && !validateFieldLength(formData.emergency_contact_no, 20)) {
      validationErrors.emergency_contact_no = getValidationMessage('emergency_contact_no', 'max');
    }

    if (formData.emergency_contact_relationship && !validateFieldLength(formData.emergency_contact_relationship, 100)) {
      validationErrors.emergency_contact_relationship = getValidationMessage('emergency_contact_relationship', 'max');
    }

    if (formData.terms_and_condition_acceptance && !validateFieldLength(formData.terms_and_condition_acceptance, 50)) {
      validationErrors.terms_and_condition_acceptance = getValidationMessage('terms_and_condition_acceptance', 'max');
    }

    if (formData.privacy_policy_acceptance && !validateFieldLength(formData.privacy_policy_acceptance, 50)) {
      validationErrors.privacy_policy_acceptance = getValidationMessage('privacy_policy_acceptance', 'max');
    }

    // If there are validation errors, set them and return
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      showError('Please fix the validation errors below.', 'Validation Error');
      return;
    }

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
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/users')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={createUserMutation.isPending}
            className="flex items-center space-x-2"
          >
            {createUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Create User</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                placeholder="Mobile number"
                error={fieldErrors['mobile_no']}
              />
            </div>
            
            <InputField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              error={fieldErrors['date_of_birth']}
            />
            
            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              options={[
                { value: '', label: 'Select gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' }
              ]}
              error={fieldErrors['gender']}
            />
          </FormSection>

          <FormSection title="Location Information">
            <InputField
              label="Address"
              name="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address"
              error={fieldErrors['address']}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="Longitude"
                error={fieldErrors['longitude']}
              />
              
              <InputField
                label="Latitude"
                name="latitude"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="Latitude"
                error={fieldErrors['latitude']}
              />
            </div>
          </FormSection>

          <FormSection title="Preferences & Emergency Contact">
            <InputField
              label="Preferred Sports"
              name="preferred_sports"
              value={formData.preferred_sports || ''}
              onChange={(e) => handleInputChange('preferred_sports', e.target.value)}
              placeholder="e.g., Football, Basketball"
              error={fieldErrors['preferred_sports']}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Emergency Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Emergency contact name"
                error={fieldErrors['emergency_contact_name']}
              />
              
              <InputField
                label="Emergency Contact Number"
                name="emergency_contact_no"
                value={formData.emergency_contact_no || ''}
                onChange={(e) => handleInputChange('emergency_contact_no', e.target.value)}
                placeholder="Emergency contact number"
                error={fieldErrors['emergency_contact_no']}
              />
              
              <InputField
                label="Relationship"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship || ''}
                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                placeholder="e.g., Spouse, Parent"
                error={fieldErrors['emergency_contact_relationship']}
              />
            </div>
          </FormSection>

          <FormSection title="Legal Agreements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Terms & Conditions Acceptance"
                name="terms_and_condition_acceptance"
                type="datetime-local"
                value={formData.terms_and_condition_acceptance || ''}
                onChange={(e) => handleInputChange('terms_and_condition_acceptance', e.target.value)}
                error={fieldErrors['terms_and_condition_acceptance']}
              />
              
              <InputField
                label="Privacy Policy Acceptance"
                name="privacy_policy_acceptance"
                type="datetime-local"
                value={formData.privacy_policy_acceptance || ''}
                onChange={(e) => handleInputChange('privacy_policy_acceptance', e.target.value)}
                error={fieldErrors['privacy_policy_acceptance']}
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

        </form>
      </Card>
    </div>
  );
};

export default UserCreatePage;
