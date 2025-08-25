import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Key } from 'lucide-react';
import {
  DataTable, Button, Modal, Card,
  InputField, TextareaField, FormSection, FormActions, SelectField,
} from '../components/UI';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchRoles, createRole, updateRole, deleteRole } from '../store/slices/roleSlice';
import { fetchPermissions } from '../store/slices/permissionSlice';
import type { Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '../types';

const RolesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { roles, isLoading, error } = useAppSelector(state => state.roles);
  const { permissions } = useAppSelector(state => state.permissions);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1',
  });

  const [editForm, setEditForm] = useState<UpdateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1',
  });

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // You can add a toast notification here
      console.error('Role error:', error);
    }
  }, [error]);

  const handleCreateRole = async () => {
    try {
      await dispatch(createRole(createForm)).unwrap();
      setIsCreateModalOpen(false);
      resetCreateForm();
      dispatch(fetchRoles());
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      await dispatch(updateRole({ roleId: selectedRole.id, roleData: editForm })).unwrap();
      setIsEditModalOpen(false);
      setSelectedRole(null);
      resetEditForm();
      dispatch(fetchRoles());
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      dispatch(fetchRoles());
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      display_name: '',
      description: '',
      status: '1',
    });
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      display_name: '',
      description: '',
      status: '1',
    });
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description || '',
      status: role.status,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    // Initialize with current role permissions
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      // You'll need to implement this API call in your apiService
      // await apiService.assignPermissions(selectedRole.id, selectedPermissions);
      setIsPermissionsModalOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      dispatch(fetchRoles()); // Refresh to get updated permissions
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
    },
    {
      key: 'name',
      header: 'Role Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (value: string) => (
        <div className="text-gray-600">{value || '-'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === '1' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (value: Permission[]) => (
        <div className="text-gray-600">
          {value?.length || 0} permissions
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (value: string) => (
        <span className="text-gray-500">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-48',
      render: (_: any, role: Role) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPermissionsModal(role)}
            leftIcon={<Key className="h-4 w-4" />}
          >
            Permissions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(role)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteModal(role)}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {roles?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Key className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {permissions?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {roles?.filter(role => role.status === '1').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roles Table */}
      <DataTable
        data={roles || []}
        columns={tableColumns}
        isLoading={isLoading}
        searchPlaceholder="Search roles..."
        showPagination={false}
      />

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
        size="lg"
      >
        <FormSection>
          <InputField 
            label="Role Name" 
            name="name" 
            value={createForm.name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, name: e.target.value }))} 
            placeholder="e.g., admin, user, moderator" 
            required 
          />
          <InputField 
            label="Display Name" 
            name="display_name" 
            value={createForm.display_name || ''} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, display_name: e.target.value }))} 
            placeholder="e.g., Administrator, User, Moderator" 
            required 
          />
          <TextareaField 
            label="Description" 
            name="description" 
            value={createForm.description || ''} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm(prev => ({ ...prev, description: e.target.value }))} 
            placeholder="Describe the role's purpose and responsibilities" 
            rows={3} 
          />
          <SelectField
            label="Status"
            name="status"
            value={createForm.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' }
            ]}
            required
          />
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateRole}>
            Create Role
          </Button>
        </FormActions>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Role"
        size="lg"
      >
        <FormSection>
          <InputField 
            label="Role Name" 
            name="name" 
            value={editForm.name || ''} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
            required 
          />
          <InputField 
            label="Display Name" 
            name="display_name" 
            value={editForm.display_name || ''} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))} 
            required 
          />
          <TextareaField 
            label="Description" 
            name="description" 
            value={editForm.description || ''} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))} 
            rows={3} 
          />
          <SelectField
            label="Status"
            name="status"
            value={editForm.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' }
            ]}
            required
          />
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRole}>
            Update Role
          </Button>
        </FormActions>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete role <strong>{selectedRole?.name}</strong>? 
            This action cannot be undone.
          </p>
        </div>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRole}>
            Delete Role
          </Button>
        </FormActions>
      </Modal>

      {/* Permissions Assignment Modal */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`Manage Permissions - ${selectedRole?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select the permissions that should be assigned to this role.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {permissions?.map((permission) => (
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
                  <div className="font-medium text-gray-900">{permission.name}</div>
                  {permission.description && (
                    <div className="text-sm text-gray-500">{permission.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <FormActions>
          <Button variant="secondary" onClick={() => setIsPermissionsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePermissions}>
            Save Permissions
          </Button>
        </FormActions>
      </Modal>
    </div>
  );
};

export default RolesPage;
