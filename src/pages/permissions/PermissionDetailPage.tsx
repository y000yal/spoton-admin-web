import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, Shield, Edit, Trash2 } from 'lucide-react';
import { PermissionGate } from '../../components/UI';

import { usePermission, useDeletePermission } from '../../hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';

const PermissionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissionId } = useParams<{ permissionId: string }>();
  
  // Parse permissionId and validate
  const parsedPermissionId = parseInt(permissionId || '0');
  
  // Validate permissionId
  if (!permissionId || isNaN(parsedPermissionId) || parsedPermissionId <= 0) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Invalid Permission ID</h3>
        <p className="mt-1 text-sm text-gray-500">The permission ID is invalid or missing.</p>
        <div className="mt-6">
          <Button onClick={() => navigate("/permissions")}>Back to Permissions</Button>
        </div>
      </div>
    );
  }

  // React Query hooks
  const { data: currentPermission, isLoading, error } = usePermission(parsedPermissionId);
  const deletePermissionMutation = useDeletePermission();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    if (permissionId) {
      navigate(`/permissions/${permissionId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (currentPermission && window.confirm(`Are you sure you want to delete permission "${currentPermission.name}"?`)) {
      try {
        await deletePermissionMutation.mutateAsync(currentPermission.id);
        
        // Invalidate and refetch the permissions list data BEFORE navigation
        await queryClient.invalidateQueries({ queryKey: ["permissions"] });
        await queryClient.refetchQueries({ queryKey: ["permissions"] });
        
        // Navigate after ensuring fresh data is available
        navigate('/permissions');
      } catch (error) {
        console.error('Failed to delete permission:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentPermission) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Permission not found</h3>
        <p className="mt-1 text-sm text-gray-500">The permission you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/permissions')}>
            Back to Permissions
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      '1': { label: 'Active', className: 'bg-green-100 text-green-800' },
      '0': { label: 'Inactive', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
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
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Permission Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <PermissionGate permission={'permission-update'}>
            <Button
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </PermissionGate>
          
          <PermissionGate permission={'permission-destroy'}>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <p className="text-lg text-gray-900">{currentPermission.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <p className="text-lg text-gray-900">{currentPermission.display_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-900">
                {currentPermission.slug}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="mt-1">
                {getStatusBadge(currentPermission.status)}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <p className="text-gray-900">
                {currentPermission.description || 'No description provided'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <p className="text-gray-900">
                {currentPermission.created_at || 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updated At
              </label>
              <p className="text-gray-900">
                {currentPermission.updated_at || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PermissionDetailPage;
