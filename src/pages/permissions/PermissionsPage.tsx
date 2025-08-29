import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Key,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchPermissions,
  searchPermissions,
  deletePermission,
  clearPermissions,
  resetPermissionsState,
} from "../../store/slices/permissionSlice";
import type { Permission } from "../../types";
import {
  Button,
  Modal,
  Card,
  DataTable,
  FormActions,
} from "../../components/UI";

const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { permissions, isLoading, error } = useAppSelector((state) => state.permissions);
  const hasInitialFetch = useRef(false);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Search and pagination state
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);

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
    dispatch(fetchPermissions({ page: 1, limit: currentPageSize, forceRefresh: true }));
  };

  const handleRefresh = () => {
    // Reset all search and pagination state
    setSearchField("name");
    setSearchValue("");
    setCurrentPage(1);
    
    // Force a fresh fetch by clearing the existing permissions data first
    // This ensures we get completely fresh data from the API
    dispatch(fetchPermissions({ page: 1, limit: currentPageSize, forceRefresh: true }));
  };

  // Initial load only
  useEffect(() => {
    let isMounted = true;
    if (!hasInitialFetch.current && isMounted) {
      hasInitialFetch.current = true;
      console.log("🔄 Initial permissions fetch triggered");
      dispatch(fetchPermissions({ page: 1, limit: currentPageSize }));
    }
    return () => {
      isMounted = false;
    };
  }, [dispatch, currentPageSize]);

  // Handle search and pagination changes (only after initial load)
  useEffect(() => {
    // Skip the first render to prevent duplicate API calls
    if (!hasInitialFetch.current) {
      return;
    }

    // Skip if this is the initial state (no actual changes from user interaction)
    const isInitialState = currentPage === 1 && searchField === "name" && searchValue === "";
    if (isInitialState) {
      console.log("🔄 Skipping permissions useEffect - initial state detected");
      return;
    }

    console.log("🔄 Permissions search/pagination useEffect triggered:", { searchField, searchValue, currentPage });

    // Use the enhanced searchPermissions thunk for better search handling
    if (searchValue.trim()) {
      dispatch(searchPermissions({
        page: currentPage,
        limit: currentPageSize,
        searchField,
        searchValue,
      }));
    } else {
      // No search value, just fetch with pagination
      dispatch(fetchPermissions({
        page: currentPage,
        limit: currentPageSize,
      }));
    }
  }, [searchField, searchValue, currentPage, currentPageSize, dispatch]);

  useEffect(() => {
    if (error) {
      console.error("Permission error:", error);
    }
  }, [error]);

  const handleEditPermission = (permission: Permission) => {
    navigate(`/permissions/${permission.id}/edit`);
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      await dispatch(deletePermission(selectedPermission.id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
      dispatch(fetchPermissions({ page: 1, limit: currentPageSize, forceRefresh: true }));
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  };

  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
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
      header: "Permission Name",
      searchable: true,
      render: (value: unknown) => (
        <div className="font-medium text-gray-900">{String(value)}</div>
      ),
    },
    {
      key: "display_name",
      header: "Display Name",
      searchable: true,
      render: (value: unknown) => (
        <div className="text-gray-600">{value ? String(value) : "-"}</div>
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
          <p className="text-gray-600">Manage system permissions and access control</p>
        </div>
        <Button
          onClick={() => navigate('/permissions/create')}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Permission
        </Button>
      </div>

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
                {permissions?.data?.length || 0}
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
                {permissions?.data?.filter((permission) => permission.status === "1").length || 0}
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
              <p className="text-sm font-medium text-gray-600">Inactive Permissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {permissions?.data?.filter((permission) => permission.status === "0").length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Permissions Table */}
      <DataTable
        data={
          permissions || {
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
        onClearSearch={handleClearSearch}
        onRefresh={handleRefresh}
        onPageChange={(page) => {
          setCurrentPage(page);
          if (searchValue.trim()) {
            dispatch(searchPermissions({
              page,
              limit: currentPageSize,
              searchField,
              searchValue,
            }));
          } else {
            dispatch(fetchPermissions({
              page,
              limit: currentPageSize,
            }));
          }
        }}
        onPageSizeChange={(newPageSize) => {
          setCurrentPageSize(newPageSize);
          setCurrentPage(1);
          if (searchValue.trim()) {
            dispatch(searchPermissions({
              page: 1,
              limit: newPageSize,
              searchField,
              searchValue,
            }));
          } else {
            dispatch(fetchPermissions({
              page: 1,
              limit: newPageSize,
            }));
          }
        }}
        searchField={searchField}
        searchValue={searchValue}
        searchPlaceholder="Search permissions..."
        showSearch={true}
        showPagination={true}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Permission"
        size="sm"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2 leading-relaxed">
            Are you sure you want to delete the permission{" "}
            <span className="font-semibold text-gray-900">
              {selectedPermission?.name}
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
            onClick={handleDeletePermission}
            className="px-6 py-2"
          >
            Delete Permission
          </Button>
        </FormActions>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
