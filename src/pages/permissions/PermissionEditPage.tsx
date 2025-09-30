import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updatePermission, fetchPermission } from '../../store/slices/permissionSlice';

import { Card, Button, InputField, TextareaField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, Key as KeyIcon, Save, X } from 'lucide-react';
import type { UpdatePermissionRequest } from '../../types';

const PermissionEditPage: React.FC = () => {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentPermission, isLoading } = useAppSelector(state => state.permissions);

  const [formData, setFormData] = useState<UpdatePermissionRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permissionId) {
      dispatch(fetchPermission(parseInt(permissionId)));
    }
  }, [permissionId, dispatch]);

  useEffect(() => {
    if (currentPermission) {
      setFormData({
        name: currentPermission.name || '',
        display_name: currentPermission.display_name || '',
        description: currentPermission.description || '',
        status: currentPermission.status || '1'
      });
    }
  }, [currentPermission]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(updatePermission({ permissionId: parseInt(permissionId), permissionData: formData })).unwrap();
      navigate('/permissions');
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/permissions');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permission information...</p>
        </div>
      </div>
    );
  }

  if (!currentPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permission Not Found</h2>
          <p className="text-gray-600 mb-6">The permission you're looking for doesn't exist.</p>
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
            onClick={() => navigate('/permissions')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <KeyIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Permission</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="permission-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Permission</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <form id="permission-form" onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Permission Information" icon={<KeyIcon className="w-5 h-5" />}>
            <InputField
              label="Permission Name"
              name="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., user.create, user.read, user.update"
              required
            />
            
            <InputField
              label="Display Name"
              name="display_name"
              value={formData.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="e.g., Create User, Read User, Update User"
              required
            />
            
            <TextareaField
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this permission allows users to do"
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

        </form>
      </Card>
    </div>
  );
};

export default PermissionEditPage;
