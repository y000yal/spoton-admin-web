import React, { useState, useEffect } from 'react';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';
import { useToast } from '../contexts/ToastContext';
import { DataTable, Button, Card } from '../components/UI';
import { Modal } from '../components/UI';
import { FormSection, FormRow, InputField, SelectField, FormActions } from '../components/UI';
import { Plus, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/userSlice';
import { fetchRoles } from '../store/slices/roleSlice';

const UsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector(state => state.users);
  const { roles } = useAppSelector(state => state.roles);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    role_id: 1,
    email: '',
    full_name: {
      first_name: '',
      middle_name: '',
      last_name: ''
    },
    username: '',
    password: '',
    confirm_password: '',
    address: '',
    mobile_no: 0
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    role_id: 1,
    full_name: {
      first_name: '',
      middle_name: '',
      last_name: ''
    },
    email: '',
    username: '',
    status: 1
  });

  // Search and pagination state
  const [searchField, setSearchField] = useState('username');
  const [searchValue, setSearchValue] = useState('');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]); // Initial load only

  // Remove the search-related useEffect since we handle search directly in handleSearch
  // useEffect(() => {
  //   if (searchField || searchValue) {
  //     dispatch(fetchUsers({ page: currentPage, limit: 10 }));
  //   }
  // }, [currentPage, searchField, searchValue, dispatch]); // Search and pagination changes

  const handleCreateUser = async () => {
    // Clear previous field errors
    setCreateFieldErrors({});
    
    try {
      await dispatch(createUser(createForm)).unwrap();
      showSuccess('User created successfully!');
      setIsCreateModalOpen(false);
      resetCreateForm();
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      // Handle validation errors (422 status)
      if (error?.response?.status === 422) {
        const errorData = error.response.data;
        console.log('Create validation error data:', errorData);
        
        if (errorData?.message) {
          // Parse validation error messages
          if (typeof errorData.message === 'object') {
            // Handle nested validation errors like "full_name.last_name"
            const newFieldErrors: Record<string, string> = {};
            Object.entries(errorData.message).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                newFieldErrors[field] = messages.join(', ');
              } else {
                newFieldErrors[field] = String(messages);
              }
            });
            setCreateFieldErrors(newFieldErrors);
            console.log('Create field errors set:', newFieldErrors);
          } else {
            showError(errorData.message);
          }
        } else {
          showError('Validation failed. Please check your input.');
        }
      } else {
        showError('Failed to create user. Please try again.');
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    // Clear previous field errors
    setFieldErrors({});
    
    try {
      await dispatch(updateUser({ userId: selectedUser.id, userData: editForm })).unwrap();
      showSuccess('User updated successfully!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetEditForm();
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    } catch (error: any) {
      console.error('Failed to update user:', error);
      
      // Handle validation errors (422 status)
      if (error?.response?.status === 422) {
        const errorData = error.response.data;
        console.log('Validation error data:', errorData);
        
        if (errorData?.message) {
          // Parse validation error messages
          if (typeof errorData.message === 'object') {
            // Handle nested validation errors like "full_name.last_name"
            const newFieldErrors: Record<string, string> = {};
            Object.entries(errorData.message).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                newFieldErrors[field] = messages.join(', ');
              } else {
                newFieldErrors[field] = String(messages);
              }
            });
            setFieldErrors(newFieldErrors);
            console.log('Field errors set:', newFieldErrors);
          } else {
            showError(errorData.message);
          }
        } else {
          showError('Validation failed. Please check your input.');
        }
      } else {
        showError('Failed to update user. Please try again.');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      showSuccess('User deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showError('Failed to delete user. Please try again.');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      role_id: 1,
      email: '',
      full_name: { first_name: '', middle_name: '', last_name: '' },
      username: '',
      password: '',
      confirm_password: '',
      address: '',
      mobile_no: 0,
    });
    setCreateFieldErrors({});
  };

  const resetEditForm = () => {
    setEditForm({
      role_id: 1,
      full_name: { first_name: '', middle_name: '', last_name: '' },
      email: '',
      username: '',
    });
    setFieldErrors({});
  };

  const openEditModal = (user: User) => {
    if (!user) {
      showError('Invalid user data. Please try again.');
      return;
    }
    
    console.log('Opening edit modal for user:', user);
    console.log('User full_name:', user.full_name, 'Type:', typeof user.full_name);
    
    setSelectedUser(user);
    
    // Parse the full_name string into parts with proper null checks
    const fullName = user.full_name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const middleName = nameParts.length > 2 ? nameParts[1] : '';
    const lastName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : nameParts[1] || '';
    
    setEditForm({
      role_id: user.role?.id || 1,
      full_name: {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
      },
      email: user.email || '',
      username: user.username || '',
      status: user.status || 0,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    if (!user) {
      showError('Invalid user data. Please try again.');
      return;
    }
    
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      searchable: false,
    },
    {
      key: 'full_name',
      header: 'Full Name',
      searchable: true,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      searchable: true,
      render: (value: unknown) => (
        <div className="text-gray-600">{String(value)}</div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      searchable: true,
    },
    {
      key: 'status',
      header: 'Status',
      searchable: true,
      render: (value: unknown) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          String(value) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {String(value) === '1' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      searchable: false,
      render: (value: unknown, item: User) => {
        const role = (item as any).role;
        return role ? (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {role.display_name || role.name}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created At',
      searchable: false,
      render: (value: unknown) => (
        <span className="text-gray-600">
          {value ? new Date(String(value)).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      searchable: false,
      render: (value: unknown, item: User) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(item)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => openDeleteModal(item)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const roleOptions = roles?.data?.map(role => ({
    value: role.id,
    label: role.name,
  })) || [];

  const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
    { value: 2, label: 'Email Pending' },
  ];

  const handleSearch = (field: string, value: string) => {
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on new search
    
    // Only add filter parameters if there's a search value
    const params: any = { 
      page: 1, 
      limit: 10
    };
    
    if (value.trim()) {
      // Only use Laravel-style format: filter[field_name] = value
      params[`filter[${field}]`] = value.trim();
    }
    
    dispatch(fetchUsers(params));
  };

  const handleClearSearch = () => {
    setSearchField('full_name');
    setSearchValue('');
    setCurrentPage(1); // Reset to first page on clear
    // Fetch fresh data from Redux store
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.total || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <DataTable
        data={users || { data: [], current_page: 1, total: 0, from: 0, to: 0, last_page: 1, prev_page_url: null, next_page_url: null, first_page_url: '', last_page_url: '', path: '', per_page: 10, links: [] }}
        columns={tableColumns}
        isLoading={isLoading}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
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
          
          dispatch(fetchUsers(params));
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
          
          dispatch(fetchUsers(params));
        }}
        searchField={searchField}
        searchValue={searchValue}
        searchPlaceholder="Search users..."
        showSearch={true}
        showPagination={true}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFieldErrors({});
        }}
        title="Create New User"
        size="lg"
      >
        <FormSection>
          <FormRow>
            <InputField
              label="First Name"
              name="first_name"
              value={createForm.full_name.first_name}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                full_name: { ...prev.full_name, first_name: e.target.value }
              }))}
              required
              error={createFieldErrors['full_name.first_name'] || createFieldErrors['first_name']}
            />
            <InputField
              label="Middle Name"
              name="middle_name"
              value={createForm.full_name.middle_name || ''}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                full_name: {
                  ...prev.full_name,
                  middle_name: e.target.value
                }
              }))}
              placeholder="Middle name (optional)"
              error={createFieldErrors['full_name.middle_name'] || createFieldErrors['middle_name']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Last Name"
              name="last_name"
              value={createForm.full_name.last_name}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                full_name: { ...prev.full_name, last_name: e.target.value }
              }))}
              required
              error={createFieldErrors['full_name.last_name'] || createFieldErrors['last_name']}
            />
            <SelectField
              label="Role"
              name="role_id"
              value={createForm.role_id}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                role_id: Number(e.target.value)
              }))}
              options={roleOptions}
              required
              error={createFieldErrors['role_id']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Email"
              name="email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
              error={createFieldErrors['email']}
            />
            <InputField
              label="Username"
              name="username"
              value={createForm.username}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                username: e.target.value
              }))}
              required
              error={createFieldErrors['username']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Password"
              name="password"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
              showPasswordToggle
              error={createFieldErrors['password']}
            />
            <InputField
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={createForm.confirm_password}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                confirm_password: e.target.value
              }))}
              required
              showPasswordToggle
              error={createFieldErrors['confirm_password']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Address"
              name="address"
              value={createForm.address}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                address: e.target.value
              }))}
              required
              error={createFieldErrors['address']}
            />
            <InputField
              label="Mobile Number"
              name="mobile_no"
              type="tel"
              value={createForm.mobile_no}
              onChange={(e) => setCreateForm(prev => ({
                ...prev,
                mobile_no: Number(e.target.value)
              }))}
              required
              error={createFieldErrors['mobile_no']}
            />
          </FormRow>
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser}>
            Create User
          </Button>
        </FormActions>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFieldErrors({});
        }}
        title="Edit User"
        size="lg"
      >
        <FormSection>
          <FormRow>
            <InputField
              label="First Name"
              name="first_name"
              value={editForm.full_name?.first_name || ''}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                full_name: { ...prev.full_name!, first_name: e.target.value }
              }))}
              required
              error={fieldErrors['full_name.first_name'] || fieldErrors['first_name']}
            />
            <InputField
              label="Middle Name"
              name="middle_name"
              value={editForm.full_name?.middle_name || ''}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                full_name: { ...prev.full_name!, middle_name: e.target.value }
              }))}
              error={fieldErrors['full_name.middle_name'] || fieldErrors['middle_name']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Last Name"
              name="last_name"
              value={editForm.full_name?.last_name || ''}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                full_name: { ...prev.full_name!, last_name: e.target.value }
              }))}
              required
              error={fieldErrors['full_name.last_name'] || fieldErrors['last_name']}
            />
            <SelectField
              label="Role"
              name="role_id"
              value={editForm.role_id || 1}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                role_id: Number(e.target.value)
              }))}
              options={roleOptions}
              required
              error={fieldErrors['role_id']}
            />
          </FormRow>
          <FormRow>
            <InputField
              label="Email"
              name="email"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
              error={fieldErrors['email']}
            />
            <InputField
              label="Username"
              name="username"
              value={editForm.username || ''}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                username: e.target.value
              }))}
              required
              error={fieldErrors['username']}
            />
          </FormRow>
          <FormRow>
          <SelectField
              label="Status"
              name="status"
              value={editForm?.status || 1}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                status: Number(e.target.value)
              }))}
              options={statusOptions}
              required
              error={fieldErrors['status']}
            />
          </FormRow>
        </FormSection>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser}>
            Update User
          </Button>
        </FormActions>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        size="sm"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>? 
            This action cannot be undone.
          </p>
        </div>
        <FormActions>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </FormActions>
      </Modal>
    </div>
  );
};

export default UsersPage;
