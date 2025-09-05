import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, InputField, TextareaField, FormSection, FormActions } from '../../components/UI';
import { ArrowLeft, Save, X, Shield } from 'lucide-react';
import type { CreatePermissionRequest } from '../../types';
import { useCreatePermission } from '../../hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';

const PermissionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // React Query hooks
  const createPermissionMutation = useCreatePermission();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreatePermissionRequest>({
    name: '',
    display_name: '',
    slug: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreatePermissionRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createPermissionMutation.mutateAsync(formData);
      
      // Invalidate and refetch the permissions list data to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["permissions"] });
      
      // Wait for the invalidation to complete and data to be refetched
      await queryClient.refetchQueries({ queryKey: ["permissions"] });
      
      // Only navigate after data is fully updated
      navigate('/permissions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create permission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/permissions');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/permissions')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Permissions
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Create Permission</h1>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Permission Details" description="Enter the permission information">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InputField
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., user-create"
                required
                helpText="Internal name for the permission (lowercase, hyphen-separated)"
              />

              <InputField
                label="Display Name"
                name="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="e.g., Create User"
                required
                helpText="Human-readable name for the permission"
              />


              <div className="sm:col-span-2">
                <TextareaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this permission allows users to do..."
                  rows={3}
                  helpText="Optional description of the permission's purpose"
                />
              </div>
            </div>
          </FormSection>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              leftIcon={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSubmitting ? 'Creating...' : 'Create Permission'}
            </Button>
          </FormActions>
        </form>
      </Card>
    </div>
  );
};

export default PermissionCreatePage;
