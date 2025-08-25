import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Key, Shield, Lock } from 'lucide-react';
import {
  DataTable, Button, Modal, Card,
  InputField, TextareaField, FormSection, FormActions, SelectField,
} from '../components/UI';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchPermissions, createPermission, updatePermission, deletePermission, clearError } from '../store/slices/permissionSlice';
import { useToast } from '../contexts/ToastContext';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../types';

const PermissionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions, isLoading, error } = useAppSelector((state) => state.permissions);
  const { showSuccess, showError } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreatePermissionRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1',
  });

  const [editForm, setEditForm] = useState<UpdatePermissionRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1',
  });

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError(error, 'Permission Error');
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleCreatePermission = async () => {
    try {
      await dispatch(createPermission(createForm)).unwrap();
      setIsCreateModalOpen(false);
      resetCreateForm();
      dispatch(fetchPermissions());
      showSuccess('Permission created successfully!');
    } catch (error) {
      console.error('Failed to create permission:', error);
    }
  };

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return;
    
    try {
      await dispatch(updatePermission({ 
        permissionId: selectedPermission.id, 
        permissionData: editForm 
      })).unwrap();
      setIsEditModalOpen(false);
      setSelectedPermission(null);
      resetEditForm();
      dispatch(fetchPermissions());
      showSuccess('Permission updated successfully!');
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;
    
    try {
      await dispatch(deletePermission(selectedPermission.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
      dispatch(fetchPermissions());
      showSuccess('Permission deleted successfully!');
    } catch (error) {
      console.error('Failed to delete permission:', error);
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

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setEditForm({
      name: permission.name,
      display_name: permission.display_name,
      description: permission.description || '',
      status: permission.status,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
    },
    {
      key: 'name',
      header: 'Permission Name',
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
      key: 'created_at',
      header: 'Created At',
      render: (value: string) => (
        <span className="text-gray-500">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (_: unknown, permission: Permission) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(permission)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteModal(permission)}
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
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="text-gray-600">Manage system permissions and access controls</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Permission
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          error={error} 
          onClose={handleClearError}
          className="mb-6"
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {permissions?.filter(permission => permission.status === '1').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Lock className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {permissions?.filter(permission => permission.status === '0').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Permissions Table */}
      <DataTable
        data={permissions || []}
        columns={tableColumns}
        isLoading={isLoading}
        searchPlaceholder="Search permissions..."
        showPagination={false}
      />

      {/* Create Permission Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Permission"
        size="lg"
      >
        <FormSection>
          <InputField 
            label="Permission Name" 
            name="name" 
            value={createForm.name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, name: e.target.value }))} 
            placeholder="e.g., user.create, user.read" 
            required 
          />
          <InputField 
            label="Display Name" 
            name="display_name" 
            value={createForm.display_name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, display_name: e.target.value }))} 
            placeholder="e.g., Create User, Read User" 
            required 
          />
          <TextareaField 
            label="Description" 
            name="description" 
            value={createForm.description} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm(prev => ({ ...prev, description: e.target.value }))} 
            placeholder="Describe what this permission allows" 
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
          <Button onClick={handleCreatePermission}>
            Create Permission
          </Button>
        </FormActions>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Permission"
        size="lg"
      >
        <FormSection>
          <InputField 
            label="Permission Name" 
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
          <Button onClick={handleUpdatePermission}>
            Update Permission
          </Button>
        </FormActions>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Permission"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete permission <strong>{selectedPermission?.name}</strong>? 
            This action cannot be undone and may affect roles that use this permission.
          </p>
        </div>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePermission}>
            Delete Permission
          </Button>
        </FormActions>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
