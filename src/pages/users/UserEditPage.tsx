import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser, fetchUser } from '../../store/slices/userSlice';
import { fetchRoles } from '../../store/slices/roleSlice';
import { useToast } from '../../contexts/ToastContext';

import { Card, Button, InputField, SelectField, FormSection } from '../../components/UI';
import { ArrowLeft, Save, X, Mail, Users } from 'lucide-react';
import type { UpdateUserRequest } from '../../types';
import { userService } from '../../services/api/users';
import { validateDateOfBirth, validateFieldLength, getValidationMessage } from '../../utils/userValidation';

const UserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  
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
    role_id: undefined,
    status: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSwitchingUser, setIsSwitchingUser] = useState(true); // Start as true to show loading initially
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const previousUserId = useRef<string | undefined>(userId);

  // Clear form data immediately when userId changes
  useEffect(() => {
    if (userId && userId !== previousUserId.current) {
      // Clear form data immediately
      setFormData({
        username: '',
        email: '',
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
        role_id: undefined,
        status: undefined
      });
      setIsSwitchingUser(true);
      previousUserId.current = userId;
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    
    if (userId && isMounted) {
      dispatch(fetchUser(parseInt(userId)));
    }
    
    return () => {
      isMounted = false;
    };
  }, [userId, dispatch]);

  useEffect(() => {
    if (currentUser) {
      // Handle both string and object full_name formats
      let firstName = '';
      let middleName = '';
      let lastName = '';

      if (typeof currentUser.full_name === 'string') {
        const nameParts = currentUser.full_name.split(' ');
        firstName = nameParts[0] || '';
        middleName = nameParts.slice(1, -1).join(' ') || '';
        lastName = nameParts.slice(-1)[0] || '';
      } else if (currentUser.full_name && typeof currentUser.full_name === 'object') {
        firstName = currentUser.full_name.first_name || '';
        middleName = currentUser.full_name.middle_name || '';
        lastName = currentUser.full_name.last_name || '';
      }

      setFormData({
        username: currentUser.username || currentUser.email || '',
        email: currentUser.email || '',
        full_name: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName
        },
        mobile_no: currentUser.mobile_no || '',
        date_of_birth: currentUser.date_of_birth || '',
        gender: currentUser.gender || '',
        country_id: currentUser.country_id || undefined,
        address: currentUser.address || '',
        longitude: currentUser.longitude || '',
        latitude: currentUser.latitude || '',
        preferred_sports: currentUser.preferred_sports || '',
        emergency_contact_name: currentUser.emergency_contact_name || '',
        emergency_contact_no: currentUser.emergency_contact_no || '',
        emergency_contact_relationship: currentUser.emergency_contact_relationship || '',
        terms_and_condition_acceptance: currentUser.terms_and_condition_acceptance || '',
        privacy_policy_acceptance: currentUser.privacy_policy_acceptance || '',
        role_id: currentUser.role?.id,
        status: parseInt(currentUser.status)
      });
      
      // Clear switching state when user data is loaded
      setIsSwitchingUser(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Only fetch roles if we don't have them yet
    if (!roles || roles.data?.length === 0) {
      dispatch(fetchRoles({ page: 1, limit: 100 }));
    }
  }, [roles, dispatch]);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof UpdateUserRequest] as Record<string, unknown>),
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
      setIsSubmitting(false);
      return;
    }

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
        },
        mobile_no: formData.mobile_no,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        country_id: formData.country_id,
        address: formData.address,
        longitude: formData.longitude,
        latitude: formData.latitude,
        preferred_sports: formData.preferred_sports,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_no: formData.emergency_contact_no,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        terms_and_condition_acceptance: formData.terms_and_condition_acceptance,
        privacy_policy_acceptance: formData.privacy_policy_acceptance
      };

      const response = await dispatch(updateUser({ userId: parseInt(userId), userData: apiData })).unwrap();
      
      // Show success message from API response
      showSuccess(
        response.message || 'User updated successfully!',
        'User Updated'
      );
      
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
          const errorMessage = err && typeof err === 'object' && 'message' in err 
            ? String(err.message) 
            : 'Failed to update user';
          setError(errorMessage);
          showError(errorMessage, 'Update Failed');
        }
      } else {
        const errorMessage = err && typeof err === 'object' && 'message' in err 
          ? String(err.message) 
          : 'Failed to update user';
        setError(errorMessage);
        showError(errorMessage, 'Update Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSendVerification = async () => {
    if (!currentUser?.email) return;

    setIsSendingVerification(true);
    setError(null);

    try {
      const response = await userService.resendVerificationOtp(currentUser.email);
      
      showSuccess(
        response.message || 'Verification email sent successfully!',
        'Email Sent'
      );
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String(err.message) 
        : 'Failed to send verification email';
      setError(errorMessage);
      showError(errorMessage, 'Send Failed');
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (!currentUser && !isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Email Verification Button - Show only when status is 2 (Email Pending) */}
          {currentUser && 
           !isSwitchingUser && 
           formData.status === 2 && 
           currentUser.id === parseInt(userId || '0') && 
           formData.email && 
           formData.email === currentUser.email && (
            <Button
              onClick={handleSendVerification}
              variant="outline"
              size="sm"
              disabled={isSendingVerification || isSwitchingUser}
              className="flex items-center space-x-2"
            >
              {isSendingVerification ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send Email Verification</span>
                </>
              )}
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || isSwitchingUser}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={isSubmitting || isSwitchingUser}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        {isSwitchingUser || !currentUser || (currentUser && currentUser.id !== parseInt(userId || '0')) ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading user information...</p>
            </div>
          </div>
        ) : (
          <form id="user-form" key={userId} onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="First Name"
                name="first_name"
                value={formData.full_name?.first_name || ''}
                onChange={(e) => handleInputChange('full_name.first_name', e.target.value)}
                placeholder="First name"
                required
                disabled={isSwitchingUser}
              />
              <InputField
                label="Middle Name"
                name="middle_name"
                value={formData.full_name?.middle_name || ''}
                onChange={(e) => handleInputChange('full_name.middle_name', e.target.value)}
                placeholder="Middle name (optional)"
                disabled={isSwitchingUser}
              />
              <InputField
                label="Last Name"
                name="last_name"
                value={formData.full_name?.last_name || ''}
                onChange={(e) => handleInputChange('full_name.last_name', e.target.value)}
                placeholder="Last name"
                required
                disabled={isSwitchingUser}
              />
            </div>
            
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email address"
              required
              disabled={isSwitchingUser}
            />
            
            <InputField
              label="Username"
              name="username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Username"
              required
              disabled={isSwitchingUser}
            />
            
            <InputField
              label="Mobile Number"
              name="mobile_no"
              value={formData.mobile_no || ''}
              onChange={(e) => handleInputChange('mobile_no', e.target.value)}
              placeholder="Mobile number"
              disabled={isSwitchingUser}
              error={fieldErrors.mobile_no}
            />
            
            <InputField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              disabled={isSwitchingUser}
              error={fieldErrors.date_of_birth}
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
              disabled={isSwitchingUser}
              error={fieldErrors.gender}
            />
          </FormSection>

          <FormSection title="Location Information">
            <InputField
              label="Address"
              name="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address"
              disabled={isSwitchingUser}
              error={fieldErrors.address}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="Longitude"
                disabled={isSwitchingUser}
                error={fieldErrors.longitude}
              />
              
              <InputField
                label="Latitude"
                name="latitude"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="Latitude"
                disabled={isSwitchingUser}
                error={fieldErrors.latitude}
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
              disabled={isSwitchingUser}
              error={fieldErrors.preferred_sports}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Emergency Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                placeholder="Emergency contact name"
                disabled={isSwitchingUser}
                error={fieldErrors.emergency_contact_name}
              />
              
              <InputField
                label="Emergency Contact Number"
                name="emergency_contact_no"
                value={formData.emergency_contact_no || ''}
                onChange={(e) => handleInputChange('emergency_contact_no', e.target.value)}
                placeholder="Emergency contact number"
                disabled={isSwitchingUser}
                error={fieldErrors.emergency_contact_no}
              />
              
              <InputField
                label="Relationship"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship || ''}
                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                placeholder="e.g., Spouse, Parent"
                disabled={isSwitchingUser}
                error={fieldErrors.emergency_contact_relationship}
              />
            </div>
          </FormSection>

          <FormSection title="Legal Agreements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Terms & Conditions Acceptance"
                name="terms_and_condition_acceptance"
                type="datetime-local"
                value={formData.terms_and_condition_acceptance ? 
                  new Date(formData.terms_and_condition_acceptance).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('terms_and_condition_acceptance', e.target.value)}
                disabled={isSwitchingUser}
                error={fieldErrors.terms_and_condition_acceptance}
              />
              
              <InputField
                label="Privacy Policy Acceptance"
                name="privacy_policy_acceptance"
                type="datetime-local"
                value={formData.privacy_policy_acceptance ? 
                  new Date(formData.privacy_policy_acceptance).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('privacy_policy_acceptance', e.target.value)}
                disabled={isSwitchingUser}
                error={fieldErrors.privacy_policy_acceptance}
              />
            </div>
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
                disabled={isSwitchingUser}
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
                disabled={isSwitchingUser}
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
        )}
      </Card>
    </div>
  );
};

export default UserEditPage;
