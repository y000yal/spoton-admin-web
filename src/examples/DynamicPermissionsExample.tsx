import React from 'react';
import { useDynamicPermissions, useResourcePermissions } from '../hooks/useDynamicPermissions';
import DynamicPermissionGate from '../components/DynamicPermissionGate';

/**
 * Example component showing how to use dynamic permissions
 * This demonstrates how to work with any permission without hardcoding
 */
const DynamicPermissionsExample: React.FC = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    permissions,
    getPermissionsByPattern,
    permissionExists 
  } = useDynamicPermissions();

  // Example: Check specific permissions
  const canViewUsers = hasPermission('user-index');
  const canCreateRoles = hasPermission('role-store');
  const canDeleteMedia = hasPermission('media-destroy');

  // Example: Check multiple permissions
  const canManageUsers = hasAnyPermission(['user-store', 'user-update', 'user-destroy']);
  const canFullyManageRoles = hasAllPermissions(['role-store', 'role-update', 'role-destroy']);

  // Example: Get permissions for a specific resource
  const userPermissions = getPermissionsByPattern('user');
  const rolePermissions = getPermissionsByPattern('role');

  // Example: Check if a permission exists
  const hasNewFeaturePermission = permissionExists('new-feature-access');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dynamic Permissions Example</h1>
      
      {/* Using hooks directly */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct Permission Checks</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-medium">User Permissions</h3>
            <p>Can view users: {canViewUsers ? '✅' : '❌'}</p>
            <p>Can manage users: {canManageUsers ? '✅' : '❌'}</p>
          </div>
          
          <div className="p-4 border rounded">
            <h3 className="font-medium">Role Permissions</h3>
            <p>Can create roles: {canCreateRoles ? '✅' : '❌'}</p>
            <p>Can fully manage roles: {canFullyManageRoles ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>

      {/* Using DynamicPermissionGate component */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Component-based Permission Checks</h2>
        
        <DynamicPermissionGate permission="user-index">
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            ✅ You can view users!
          </div>
        </DynamicPermissionGate>

        <DynamicPermissionGate 
          permissions={['role-store', 'role-update']} 
          requireAll={false}
          fallback={<div className="p-4 bg-red-100 border border-red-300 rounded">❌ You cannot manage roles</div>}
        >
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            ✅ You can manage roles!
          </div>
        </DynamicPermissionGate>

        <DynamicPermissionGate permission="non-existent-permission">
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            This should not show
          </div>
        </DynamicPermissionGate>
      </div>

      {/* Resource-specific permissions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resource-specific Permissions</h2>
        <ResourcePermissionsExample />
      </div>

      {/* Available permissions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Permissions</h2>
        <div className="max-h-60 overflow-y-auto">
          <pre className="text-xs bg-gray-100 p-4 rounded">
            {JSON.stringify(permissions.map(p => ({ slug: p.slug, name: p.name })), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Example showing resource-specific permissions
 */
const ResourcePermissionsExample: React.FC = () => {
  const userPermissions = useResourcePermissions('user');
  const rolePermissions = useResourcePermissions('role');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 border rounded">
        <h3 className="font-medium">User Resource Permissions</h3>
        <ul className="text-sm space-y-1">
          <li>View: {userPermissions.canView() ? '✅' : '❌'}</li>
          <li>Create: {userPermissions.canCreate() ? '✅' : '❌'}</li>
          <li>Edit: {userPermissions.canEdit() ? '✅' : '❌'}</li>
          <li>Delete: {userPermissions.canDelete() ? '✅' : '❌'}</li>
          <li>Show: {userPermissions.canShow() ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div className="p-4 border rounded">
        <h3 className="font-medium">Role Resource Permissions</h3>
        <ul className="text-sm space-y-1">
          <li>View: {rolePermissions.canView() ? '✅' : '❌'}</li>
          <li>Create: {rolePermissions.canCreate() ? '✅' : '❌'}</li>
          <li>Edit: {rolePermissions.canEdit() ? '✅' : '❌'}</li>
          <li>Delete: {rolePermissions.canDelete() ? '✅' : '❌'}</li>
          <li>Show: {rolePermissions.canShow() ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

export default DynamicPermissionsExample;
