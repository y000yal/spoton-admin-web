import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createRole } from '../../store/slices/roleSlice';
import { fetchPermissions } from '../../store/slices/permissionSlice';
import { roleService } from '../../services/api';

import { Card, Button, InputField, TextareaField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, Save, X, Key, RefreshCw } from 'lucide-react';
import type { CreateRoleRequest } from '../../types';

const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { permissions } = useAppSelector(state => state.permissions);

  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1'
  });

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load permissions if not already loaded
  useEffect(() => {
    if (!permissionsLoaded || !permissions?.data || permissions.data.length === 0) {
      dispatch(fetchPermissions({ page: 1, limit: 100 }));
      setPermissionsLoaded(true);
    }
  }, [permissionsLoaded, permissions, dispatch]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Save permissions (will be called after role creation)
  const handleSavePermissions = async (roleId: number) => {
    setSavingPermissions(true);
    try {
      await roleService.assignPermissions(roleId, selectedPermissions);
      console.log('Permissions saved successfully');
    } catch (error) {
      console.error('Failed to save permissions:', error);
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the role first
      const newRole = await dispatch(createRole(formData)).unwrap();
      
      // If permissions are selected, save them for the new role
      if (selectedPermissions.length > 0) {
        await handleSavePermissions(newRole.id);
      }
      
      // Navigate to edit page for the newly created role
      navigate(`/roles/${newRole.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
            <p className="text-gray-600">
              Add a new role to the system and assign permissions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Role Information Form */}
        <Card className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Role Information">
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
              <div className="flex items-center space-x-3">
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
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </FormActions>
          </form>
        </Card>

        {/* Right Side - Role Permissions */}
        <Card className="lg:col-span-2">
          <div className="space-y-6">
            <FormSection title="Role Permissions">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Select the permissions that should be assigned to this new role.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allPermissionIds = (permissions?.data || []).map((p: any) => p.id);
                        setSelectedPermissions(allPermissionIds);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPermissions([])}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Remove All
                    </Button>
                  </div>
                </div>

                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">Loading permissions...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                    {(permissions?.data || [])?.map((permission: any) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {permission.display_name || permission.name}
                          </div>
                          {permission.description && (
                            <div className="text-sm text-gray-500">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                <p>Permissions will be automatically assigned when the role is created.</p>
                <p className="mt-1">After creation, you'll be redirected to edit the role for further customization.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleCreatePage;
