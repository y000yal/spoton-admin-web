import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import {
  DataTable,
  Button,
  Modal,
  Card,
  InputField,
  SelectField,
  FormRow,
  FormSection,
  FormActions,
} from '../components/UI';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import type { User, Role, CreateUserRequest, UpdateUserRequest, PaginatedResponse } from '../types';

const UsersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<PaginatedResponse<User> | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    full_name: { first_name: '', middle_name: '', last_name: '' },
    username: '',
    password: '',
    confirm_password: '',
    address: '',
    mobile_no: 0,
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    role_id: 1,
    full_name: { first_name: '', middle_name: '', last_name: '' },
    email: '',
    username: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsers({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      });
      setUsers(response);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      
      if (error?.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else if (error?.response?.status === 403) {
        showError('You do not have permission to view users.');
      } else {
        showError('Failed to load users. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      setRoles(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      
      if (error?.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else if (error?.response?.status === 403) {
        showError('You do not have permission to view roles.');
      } else {
        showError('Failed to load roles. Please try again.');
      }
    }
  };

  const handleCreateUser = async () => {
    // Clear previous field errors
    setCreateFieldErrors({});
    
    try {
      await apiService.createUser(createForm);
      showSuccess('User created successfully!');
      setIsCreateModalOpen(false);
      resetCreateForm();
      fetchUsers();
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
      await apiService.updateUser(selectedUser.id, editForm);
      showSuccess('User updated successfully!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetEditForm();
      fetchUsers();
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
      await apiService.deleteUser(selectedUser.id);
      showSuccess('User deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 404) {
        showError('User not found. It may have been deleted already.');
      } else if (error?.response?.status === 403) {
        showError('You do not have permission to delete this user.');
      } else {
        showError('Failed to delete user. Please try again.');
      }
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
    },
    {
      key: 'full_name',
      header: 'Full Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
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
      key: 'role',
      header: 'Role',
      render: (value: Role) => (
        <span className="text-gray-600">{value?.name || '-'}</span>
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
      render: (_: any, user: User) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(user)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteModal(user)}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const roleOptions = roles.map(role => ({
    value: role.id,
    label: role.name,
  }));

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
              <Users className="h-8 w-8 text-primary-600" />
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
        onPageChange={setCurrentPage}
        onSearch={setSearchQuery}
        searchPlaceholder="Search users..."
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
