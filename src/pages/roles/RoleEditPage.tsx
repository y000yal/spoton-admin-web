import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateRole, fetchRole } from '../../store/slices/roleSlice';

import { Card, Button, InputField, TextareaField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, Shield as ShieldIcon, Save, X } from 'lucide-react';
import type { UpdateRoleRequest } from '../../types';

const RoleEditPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentRole, isLoading } = useAppSelector(state => state.roles);

  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleId) {
      dispatch(fetchRole(parseInt(roleId)));
    }
  }, [roleId, dispatch]);

  useEffect(() => {
    if (currentRole) {
      setFormData({
        name: currentRole.name || '',
        display_name: currentRole.display_name || '',
        description: currentRole.description || '',
        status: currentRole.status || '1'
      });
    }
  }, [currentRole]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(updateRole({ roleId: parseInt(roleId), roleData: formData })).unwrap();
      navigate('/roles');
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading role information...</p>
        </div>
      </div>
    );
  }

  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Not Found</h2>
          <p className="text-gray-600 mb-6">The role you're looking for doesn't exist.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
            <p className="text-gray-600">
              Update information for role "{currentRole.display_name || currentRole.name}"
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Role Information" icon={<ShieldIcon className="w-5 h-5" />}>
            <InputField
              label="Role Name"
              name="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., admin, user, moderator"
              required
            />
            
            <InputField
              label="Display Name"
              name="display_name"
              value={formData.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="e.g., Administrator, User, Moderator"
              required
            />
            
            <TextareaField
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role's purpose and responsibilities"
              rows={3}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || '1'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
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

export default RoleEditPage;
