import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Shield, Users, Key, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchRoles, 
  createRole, 
  deleteRole 
} from '../../store/slices/roleSlice';
import { fetchPermissions } from '../../store/slices/permissionSlice';
import type { Role, CreateRoleRequest } from '../../types';
import { roleService } from '../../services/api';
import { 
  Button, 
  Modal, 
  Card, 
  DataTable,
  InputField, 
  TextareaField, 
  FormSection, 
  FormActions, 
  SelectField 
} from '../../components/UI';

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roles, isLoading, error } = useAppSelector(state => state.roles);
  const { permissions } = useAppSelector(state => state.permissions);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  // Permission assignment state
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [permissionsLastUpdated, setPermissionsLastUpdated] = useState<Date | null>(null);

  // Search and pagination state
  const [searchField, setSearchField] = useState('name');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Interface for role permissions from API
  interface RolePermission {
    id: number;
    slug: string;
    name: string;
    display_name?: string;
    description?: string;
  }

  // Function to refresh permissions when they're modified
  const refreshPermissions = () => {
    setPermissionsLoaded(false);
    setPermissionsLastUpdated(null);
  };

  // Function to check if permissions need refreshing (e.g., after 5 minutes)
  const shouldRefreshPermissions = () => {
    if (!permissionsLastUpdated) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return permissionsLastUpdated < fiveMinutesAgo;
  };

  // Function to force refresh permissions (e.g., when permissions are modified externally)
  const forceRefreshPermissions = () => {
    refreshPermissions();
    dispatch(fetchPermissions({ page: 1, limit: 100 })).then(() => {
      setPermissionsLoaded(true);
      setPermissionsLastUpdated(new Date());
    }).catch((error) => {
      console.error('Failed to refresh permissions:', error);
    });
  };

  // Search functions
  const handleSearch = (field: string, value: string) => {
    console.log('handleSearch called with:', { field, value });
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchField('name');
    setSearchValue('');
    setCurrentPage(1);
    // Fetch fresh data from Redux store
    dispatch(fetchRoles({ page: 1, limit: 10 }));
  };

  // Initial load only
  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 10 }));
  }, [dispatch]);

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
      limit: 10,
      page: currentPage,
    };

    if (searchValue.trim()) {
      // Only use Laravel-style format: filter[field_name] = value
      (params as any)[`filter[${searchField}]`] = searchValue.trim();
    }

    dispatch(fetchRoles(params));
  }, [searchField, searchValue, currentPage, dispatch]);

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
      dispatch(fetchRoles({ page: 1, limit: 10 }));
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleEditRole = (role: Role) => {
    navigate(`/roles/${role.id}/edit`);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      dispatch(fetchRoles({ page: 1, limit: 10 }));
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



  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const openPermissionsModal = async (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
    setPermissionsLoading(true);
    
    try {
      // Fetch role-specific permissions using the new endpoint
      const rolePermissionsData = await roleService.getRolePermissions(role.id);
     
      // Fetch all available permissions
      if (!permissionsLoaded || (Array.isArray(permissions) ? permissions.length === 0 : (permissions?.data?.length === 0)) || shouldRefreshPermissions()) {
        await dispatch(fetchPermissions({ page: 1, limit: 100 })).unwrap();
        setPermissionsLoaded(true);
        setPermissionsLastUpdated(new Date());
      }
      
      // Set selected permissions based on role permissions (using slug for comparison)
      const selectedSlugs = (rolePermissionsData.permissions || []).map((rp: RolePermission) => rp.slug);
     
      const selectedIds = (Array.isArray(permissions) ? permissions : (permissions?.data || []))
        .filter(p => selectedSlugs.includes(p.slug))
        .map(p => p.id);
      setSelectedPermissions(selectedIds);
      
    } catch (error) {
      console.error('Failed to fetch role permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
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
    
    setSavingPermissions(true);
    try {
      // Call the API to sync permissions for the role
      await roleService.assignPermissions(selectedRole.id, selectedPermissions);
      
      setIsPermissionsModalOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      
      // Only refresh roles to show updated permission counts
      dispatch(fetchRoles({ page: 1, limit: 10 }));
      
      // Show success message (you can add toast notification here if needed)
      console.log('Permissions saved successfully');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      // Show error message (you can add toast notification here if needed)
    } finally {
      setSavingPermissions(false);
    }
  };

  // Refresh permissions cache when permissions are modified externally
  useEffect(() => {
    const permissionsArray = Array.isArray(permissions) ? permissions : (permissions?.data || []);
    if (permissionsArray.length > 0 && !permissionsLoaded) {
      setPermissionsLoaded(true);
      setPermissionsLastUpdated(new Date());
    }
  }, [permissions, permissionsLoaded]);

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      searchable: false,
    },
    {
      key: 'name',
      header: 'Role Name',
      searchable: true,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      searchable: true,
      render: (value: unknown) => (
        <div className="text-gray-600">{value ? String(value) : '-'}</div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      searchable: false,
      render: (value: unknown) => (
        <div className="text-gray-600">
          {Array.isArray(value) ? value.length : 0} permissions
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      searchable: false,
      render: (value: unknown) => (
        <span className="text-gray-500">{value ? new Date(String(value)).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-48',
      searchable: false,
      render: (_: unknown, role: Role) => (
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
             onClick={() => handleEditRole(role)}
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
                {Array.isArray(roles) ? roles.length : (roles?.data?.length || 0)}
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
                {Array.isArray(permissions) ? permissions.length : (permissions?.data?.length || 0)}
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
                {Array.isArray(roles) 
                  ? roles.filter(role => role.status === '1').length 
                  : (roles?.data?.filter(role => role.status === '1').length || 0)
                }
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
              <p className="text-sm font-medium text-gray-600">Inactive Roles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Array.isArray(roles) 
                  ? roles.filter(role => role.status === '0').length 
                  : (roles?.data?.filter(role => role.status === '0').length || 0)
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roles Table */}
      <DataTable
        data={roles || { data: [], current_page: 1, total: 0, from: 0, to: 0, last_page: 1, prev_page_url: null, next_page_url: null, first_page_url: '', last_page_url: '', path: '', per_page: 10, links: [] }}
        columns={tableColumns}
        isLoading={isLoading}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch} // Clear search value when X is clicked
        onPageChange={(page) => {
          setCurrentPage(page);
          const params: any = { 
            page, 
            limit: 10
          };
          
          if (searchValue.trim()) {
            // Only use Laravel-style format: filter[field_name] = value
            params[`filter[${searchField}]`] = searchValue.trim();
          }
          
          dispatch(fetchRoles(params));
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
          
          dispatch(fetchRoles(params));
        }}
        searchField={searchField}
        searchValue={searchValue}
        searchPlaceholder="Search roles..."
        showSearch={true}
        showPagination={true}
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

      

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
        size="sm"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2 leading-relaxed">
            Are you sure you want to delete the role{' '}
            <span className="font-semibold text-gray-900">{selectedRole?.name}</span>?
            <br />
            <span className="text-sm text-gray-500">
              This action cannot be undone.
            </span>
          </p>
        </div>
        <FormActions className="pt-4">
          <Button 
            variant="secondary" 
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteRole}
            className="px-6 py-2"
          >
            Delete Role
          </Button>
        </FormActions>
      </Modal>

      {/* Permissions Assignment Modal */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title={`Manage Permissions For- ${selectedRole?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Select the permissions that should be assigned to this role.
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allPermissionIds = (Array.isArray(permissions) ? permissions : (permissions?.data || [])).map(p => p.id);
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
              <Button
                variant="ghost"
                size="sm"
                onClick={forceRefreshPermissions}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="text-gray-500 hover:text-gray-700"
              >
                Refresh
              </Button>
            </div>
          </div>
          
          {permissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading permissions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {(Array.isArray(permissions) ? permissions : (permissions?.data || []))?.map((permission) => (
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
                    <div className="font-medium text-gray-900">{permission.display_name || permission.name}</div>
                    {permission.description && (
                      <div className="text-sm text-gray-500">{permission.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <FormActions>
          <Button variant="secondary" onClick={() => setIsPermissionsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePermissions} disabled={savingPermissions}>
            {savingPermissions ? 'Saving...' : 'Save Permissions'}
          </Button>
        </FormActions>
      </Modal>
    </div>
  );
};

export default RolesPage;
