import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Key, Shield, Lock } from 'lucide-react';
import {
  DataTable, Button, Modal, Card,
  InputField, TextareaField, FormSection, FormActions, SelectField, ErrorMessage
} from '../../components/UI';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPermissions, createPermission, deletePermission, clearError } from '../../store/slices/permissionSlice';
import { useToast } from '../../contexts/ToastContext';
import type { Permission, CreatePermissionRequest } from '../../types';


const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { permissions, isLoading, error } = useAppSelector((state) => state.permissions);
  const { showSuccess, showError } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreatePermissionRequest>({
    name: '',
    display_name: '',
    description: '',
    status: '1',
  });

  // Search and pagination state
  const [searchField, setSearchField] = useState('name');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchLoading, setSearchLoading] = useState(false); // Local loading state for search operations

  // Search functions
  const handleSearch = (field: string, value: string) => {
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchField('name');
    setSearchValue('');
    setCurrentPage(1);
    setSearchLoading(false); // Clear search loading state
    // Fetch fresh data from Redux store
    dispatch(fetchPermissions({ page: 1, limit: pageSize }));
  };

  // Handle search and pagination changes (only after initial load)
  useEffect(() => {
    // Skip the first render to prevent duplicate API calls
    const isInitialRender = currentPage === 1 && !searchValue.trim();
    if (isInitialRender) return;

    const params: {
      limit?: number;
      page?: number;
      filter_field?: string;
      filter_value?: string;
    } = {
      limit: pageSize,
      page: currentPage,
    };

    if (searchValue.trim()) {
      // Only use Laravel-style format: filter[field_name] = value
      (params as any)[`filter[${searchField}]`] = searchValue.trim();
    }

    dispatch(fetchPermissions(params));
  }, [searchField, searchValue, currentPage, pageSize, dispatch]);

  // Initial load
  useEffect(() => {
    dispatch(fetchPermissions({ page: 1, limit: pageSize }));
  }, [dispatch, pageSize]);

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
      dispatch(fetchPermissions({ page: 1, limit: pageSize }));
      showSuccess('Permission created successfully!');
    } catch (error) {
      console.error('Failed to create permission:', error);
    }
  };

  const handleEditPermission = (permission: Permission) => {
    navigate(`/permissions/${permission.id}/edit`);
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;
    
    try {
      await dispatch(deletePermission(selectedPermission.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
      dispatch(fetchPermissions({ page: 1, limit: pageSize }));
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
             onClick={() => handleEditPermission(permission)}
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
           onClose={() => dispatch(clearError())}
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
                {Array.isArray(permissions) ? permissions.length : (permissions?.data?.length || 0)}
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
                {Array.isArray(permissions) 
                  ? permissions.filter(permission => permission.status === '1').length 
                  : (permissions?.data?.filter(permission => permission.status === '1').length || 0)
                }
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
                {Array.isArray(permissions) 
                  ? permissions.filter(permission => permission.status === '0').length 
                  : (permissions?.data?.filter(permission => permission.status === '0').length || 0)
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

  

      {/* Permissions Table */}
      <DataTable
        data={permissions || { data: [], current_page: 1, total: 0, from: 0, to: 0, last_page: 1, prev_page_url: null, next_page_url: null, first_page_url: '', last_page_url: '', path: '', per_page: 10, links: [] }}
        columns={tableColumns}
        isLoading={isLoading || searchLoading}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onPageChange={(page) => {
          setCurrentPage(page);
          const params: any = { 
            page, 
            limit: pageSize
          };
          
          if (searchValue.trim()) {
            // Only use Laravel-style format: filter[field_name] = value
            params[`filter[${searchField}]`] = searchValue.trim();
          }
          
          dispatch(fetchPermissions(params));
        }}
        onPageSizeChange={(newPageSize) => {
          setCurrentPage(1); // Reset to first page when changing page size
          const params: any = { 
            page: 1, 
            limit: newPageSize
          };
          
          if (searchValue.trim()) {
            // Only use Laravel-style format: filter[field_name] = value
            params[`filter[${searchField}]`] = searchValue.trim();
          }
          
          dispatch(fetchPermissions(params));
        }}
        searchField={searchField}
        searchValue={searchValue}
        searchPlaceholder="Search permissions..."
        showSearch={true}
        showPagination={true}
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
