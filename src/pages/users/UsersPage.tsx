import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsers, deleteUser } from '../../store/slices/userSlice';

import { Card, Button, DataTable } from '../../components/UI';
import { Plus, Users, Eye, Edit, Trash2 } from 'lucide-react';
import type { User } from '../../types';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { users, isLoading, error } = useAppSelector(state => state.users);
  const { roles } = useAppSelector(state => state.roles);

  const [searchField, setSearchField] = useState('username');
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const hasInitialFetch = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    if (!hasInitialFetch.current && isMounted) {
      hasInitialFetch.current = true;
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    }
    
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleSearch = (field: string, value: string) => {
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1);
    
    const params: any = { 
      page: 1, 
      limit: 10
    };
    
    if (value.trim()) {
      params[`filter[${field}]`] = value.trim();
    }
    
    dispatch(fetchUsers(params));
  };

  const handleClearSearch = () => {
    setSearchField('username');
    setSearchValue('');
    setCurrentPage(1);
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  };

  const handleViewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      try {
        await dispatch(deleteUser(user.id)).unwrap();
        // Refresh the users list
        dispatch(fetchUsers({ page: currentPage, limit: 10 }));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleName = (roleId: number) => {
    if (!roles?.data) return 'Unknown';
    const role = roles.data.find(r => r.id === roleId);
    return role ? (role.display_name || role.name) : 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      '1': { label: 'Active', className: 'bg-green-100 text-green-800' },
      '0': { label: 'Inactive', className: 'bg-red-100 text-red-800' },
      '2': { label: 'Email Pending', className: 'bg-yellow-100 text-yellow-800' }
    };

    const statusInfo = statusMap[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const tableColumns = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      searchable: false,
    },
    {
      key: 'username',
      header: 'Username',
      searchable: true,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      searchable: false,
      render: (value: unknown) => getStatusBadge(String(value)),
    },
    {
      key: 'created_at',
      header: 'Created At',
      searchable: false,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {value ? new Date(String(value)).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-48',
      searchable: false,
      render: (_: unknown, user: User) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(user)}
            leftIcon={<Eye className="h-4 w-4" />}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user)}
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={() => navigate('/users/create')}
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
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.data?.filter(user => user.status === '1').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users?.data?.filter(user => user.status === '0').length || 0}
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
            params[`filter[${searchField}]`] = searchValue.trim();
          }
          
          dispatch(fetchUsers(params));
        }}
        onPageSizeChange={(newPageSize) => {
          setCurrentPage(1);
          const params: any = { 
            page: 1, 
            limit: newPageSize
          };
          
          if (searchValue.trim()) {
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
