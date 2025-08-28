import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRoles,
  deleteRole,
} from "../../store/slices/roleSlice";
import type { Role } from "../../types";
import {
  Button,
  Modal,
  Card,
  DataTable,
  FormActions,
} from "../../components/UI";

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { roles, isLoading, error } = useAppSelector((state) => state.roles);
  const hasInitialFetch = useRef(false);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);



  // Search and pagination state
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);





  // Search functions
  const handleSearch = (field: string, value: string) => {
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchField("name");
    setSearchValue("");
    setCurrentPage(1);
    // Fetch fresh data from Redux store
    dispatch(fetchRoles({ page: 1, limit: 10, forceRefresh: true }));
  };

  const handleRefresh = () => {
    // Reset all search and pagination state
    setSearchField("name");
    setSearchValue("");
    setCurrentPage(1);
    
    // Force a fresh fetch by clearing the existing roles data first
    // This ensures we get completely fresh data from the API
    dispatch(fetchRoles({ page: 1, limit: 10, forceRefresh: true }));
  };

  // Initial load only
  useEffect(() => {
    let isMounted = true;
    if (!hasInitialFetch.current && isMounted) {
      hasInitialFetch.current = true;
      console.log("🔄 Initial fetch triggered");
      dispatch(fetchRoles({ page: 1, limit: 10 }));
    }
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Handle search and pagination changes (only after initial load)
  useEffect(() => {
    // Skip the first render to prevent duplicate API calls
    if (!hasInitialFetch.current) {
      return;
    }

    // Skip if this is the initial state (no actual changes from user interaction)
    const isInitialState = currentPage === 1 && searchField === "name" && searchValue === "";
    if (isInitialState) {
      console.log("🔄 Skipping useEffect - initial state detected");
      return;
    }

    console.log("🔄 Search/pagination useEffect triggered:", { searchField, searchValue, currentPage });

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

    console.log("🔄 Dispatching fetchRoles with params:", params);
    dispatch(fetchRoles(params));
  }, [searchField, searchValue, currentPage, dispatch]);

  useEffect(() => {
    if (error) {
      // You can add a toast notification here
      console.error("Role error:", error);
    }
  }, [error]);



  const handleEditRole = (role: Role) => {
    navigate(`/roles/${role.id}/edit`);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      dispatch(fetchRoles({ page: 1, limit: 10, forceRefresh: true }));
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };



  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };





  const tableColumns = [
    {
      key: "id",
      header: "ID",
      width: "w-16",
      searchable: false,
    },
    {
      key: "name",
      header: "Role Name",
      searchable: true,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      key: "description",
      header: "Description",
      searchable: true,
      render: (value: unknown) => (
        <div className="text-gray-600">{value ? String(value) : "-"}</div>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      searchable: false,
      render: (value: unknown) => (
        <div className="text-gray-600">
          {Array.isArray(value) ? value.length : 0} permissions
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      searchable: false,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {value ? new Date(String(value)).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "w-48",
      searchable: false,
      render: (_: unknown, role: Role) => (
        <div className="flex items-center space-x-2">
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
          onClick={() => navigate('/roles/create')}
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
                {Array.isArray(roles) ? roles.length : roles?.data?.length || 0}
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
                  ? roles.filter((role) => role.status === "1").length
                  : roles?.data?.filter((role) => role.status === "1").length ||
                    0}
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
              <p className="text-sm font-medium text-gray-600">
                Inactive Roles
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {Array.isArray(roles)
                  ? roles.filter((role) => role.status === "0").length
                  : roles?.data?.filter((role) => role.status === "0").length ||
                    0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roles Table */}
      <DataTable
        data={
          roles || {
            data: [],
            current_page: 1,
            total: 0,
            from: 0,
            to: 0,
            last_page: 1,
            prev_page_url: null,
            next_page_url: null,
            first_page_url: "",
            last_page_url: "",
            path: "",
            per_page: 10,
            links: [],
          }
        }
        columns={tableColumns}
        isLoading={isLoading}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch} // Clear search value when X is clicked
        onRefresh={handleRefresh} // Refresh data when refresh button is clicked
        onPageChange={(page) => {
          setCurrentPage(page);
          const params: any = {
            page,
            limit: 10,
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
            limit: newPageSize,
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



      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
        size="sm"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2 leading-relaxed">
            Are you sure you want to delete the role{" "}
            <span className="font-semibold text-gray-900">
              {selectedRole?.name}
            </span>
            ?
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


    </div>
  );
};

export default RolesPage;
