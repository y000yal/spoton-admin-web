import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, InputField, TextareaField, FormSection, FormActions } from '../../components/UI';
import GroupedPermissionsList from '../../components/GroupedPermissionsList';
import { ArrowLeft, Save, X, Key, RefreshCw } from 'lucide-react';
import type { CreateRoleRequest } from '../../types';
import { useCreateRole } from '../../hooks/useRoles';
import { usePermissionsData } from '../../hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';

const RoleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // React Query hooks
  const createRoleMutation = useCreateRole();
  const { data: permissionsData } = usePermissionsData({ page: 1, limit: 1000 });
  const permissions = permissionsData?.data || [];
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1'
  });

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permissions are loaded via React Query hook above

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
      // Create the role first using React Query
      const newRole = await createRoleMutation.mutateAsync(formData);
      
      // If permissions are selected, save them for the new role
      if (selectedPermissions.length > 0) {
        await handleSavePermissions(newRole.id);
      }
      
      // Invalidate and refetch the roles list data to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      
      // Wait for the invalidation to complete and data to be refetched
      await queryClient.refetchQueries({ queryKey: ["roles"] });
      
      // Only navigate after data is fully updated
      navigate('/roles');
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
                <div className="mb-4">
                  <p className="text-gray-600">
                    Select the permissions that should be assigned to this new role.
                  </p>
                </div>

                <GroupedPermissionsList
                  permissions={permissions}
                  selectedPermissions={selectedPermissions}
                  onPermissionToggle={handlePermissionToggle}
                  onSelectAll={() => {
                    const allPermissionIds = permissions.map((p: any) => p.id);
                    setSelectedPermissions(allPermissionIds);
                  }}
                  onRemoveAll={() => setSelectedPermissions([])}
                  isLoading={!permissionsData}
                  showSelectAllButtons={true}
                />
              </div>
            </FormSection>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                <p>Permissions will be automatically assigned when the role is created.</p>
                <p className="mt-1">After creation, you'll be redirected to the roles list page.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleCreatePage;
