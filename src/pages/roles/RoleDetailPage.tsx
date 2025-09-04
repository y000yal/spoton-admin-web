import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRole } from '../../store/slices/roleSlice';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, Users, Edit, Trash2 } from 'lucide-react';
import { PermissionGate } from '../../components/UI';
import { PERMISSIONS } from '../../utils/permissions';

const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roleId } = useParams<{ roleId: string }>();
  
  const { currentRole, isLoading } = useAppSelector((state) => state.roles);

  // Fetch role data when component mounts
  useEffect(() => {
    if (roleId) {
      dispatch(fetchRole(parseInt(roleId)));
    }
  }, [dispatch, roleId]);

  const handleEdit = () => {
    if (roleId) {
      navigate(`/roles/${roleId}/edit`);
    }
  };

  const handleDelete = async () => {
    if (currentRole && window.confirm(`Are you sure you want to delete role "${currentRole.name}"?`)) {
      try {
        // You can add delete functionality here if needed
        console.log('Delete role:', currentRole.id);
        navigate('/roles');
      } catch (error) {
        console.error('Failed to delete role:', error);
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

  if (!currentRole) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Role not found</h3>
        <p className="mt-1 text-sm text-gray-500">The role you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/roles')}>
            Back to Roles
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
            onClick={() => navigate('/roles')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Role Details</h1>
        </div>
        
        <div className="flex space-x-3">
          <PermissionGate permission={PERMISSIONS.ROLES_EDIT}>
            <Button
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </PermissionGate>
          
          <PermissionGate permission={PERMISSIONS.ROLES_DELETE}>
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
              <p className="text-lg text-gray-900">{currentRole.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <p className="text-lg text-gray-900">{currentRole.display_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="mt-1">
                {getStatusBadge(currentRole.status)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions Count
              </label>
              <p className="text-lg text-gray-900">
                {currentRole.permissions?.length || 0} permissions
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <p className="text-gray-900">
                {currentRole.description || 'No description provided'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <p className="text-gray-900">
                {currentRole.created_at ? new Date(currentRole.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Updated At
              </label>
              <p className="text-gray-900">
                {currentRole.updated_at ? new Date(currentRole.updated_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Permissions Section */}
      {currentRole.permissions && currentRole.permissions.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentRole.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="bg-gray-50 px-3 py-2 rounded-md border"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {permission.display_name || permission.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {permission.slug}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoleDetailPage;
