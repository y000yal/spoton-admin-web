import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Shield, MoreVertical, Eye } from "lucide-react";
import type { Role } from "../../types";
import { Button, DataTable, PermissionGate, DeleteConfirmationModal, DropdownMenu } from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";
import { useRoles, useDeleteRole } from "../../hooks/useRoles";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../hooks/usePermissionCheck";

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Table state management
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Refs to track API calls
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loading state for refresh and search
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role: Role | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    role: null,
    isLoading: false
  });

  // Query parameters
  const queryParams = {
    page: currentPage,
    limit: currentPageSize,
    sort_field: sortField,
    sort_by: sortDirection,
    ...(searchValue && { [`filter[${searchField}]`]: searchValue }),
  };

  // React Query hooks
  const { data: roles, isLoading, isFetching, error } = useRoles(queryParams);
  const deleteRoleMutation = useDeleteRole();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (roles || error) {
      setIsSearching(false);
    }
  }, [roles, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewRole = (role: Role) => {
    navigate(`/roles/${role.id}`);
  };

  const handleEditRole = (role: Role) => {
    navigate(`/roles/${role.id}/edit`);
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteModal({
      isOpen: true,
      role,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.role) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deleteRoleMutation.mutateAsync(deleteModal.role.id);
      setDeleteModal({ isOpen: false, role: null, isLoading: false });
    } catch (error) {
      console.error("Failed to delete role:", error);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, role: null, isLoading: false });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "1": { label: "Active", className: "bg-green-100 text-green-800" },
      "0": { label: "Inactive", className: "bg-red-100 text-red-800" },
    };

    const statusInfo = statusMap[status] || {
      label: "Unknown",
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const tableColumns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      hideFromSearch: true, // Hide ID from search field dropdown
      render: (_: unknown, role: Role) => role?.id || "N/A",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (_: unknown, role: Role) => role?.name || "N/A",
    },
    {
      key: "display_name",
      header: "Display Name",
      sortable: true,
      render: (_: unknown, role: Role) => role?.display_name || "N/A",
    },
    {
      key: "description",
      header: "Description",
      sortable: false,
      render: (_: unknown, role: Role) => role?.description || "N/A",
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (_: unknown, role: Role) =>
        role?.created_at
          ? new Date(role.created_at).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      hideFromSearch: true, // Hide Actions from search field dropdown
      render: (_: unknown, role: Role) => {
        if (!role) return <div>N/A</div>;

        return (
          <div className="flex justify-end relative">
            <PermissionGate 
              permissions={[PERMISSIONS.ROLES_SHOW, PERMISSIONS.ROLES_EDIT, PERMISSIONS.ROLES_DELETE]}
              requireAll={false}
              fallback={<div className="w-8 h-8"></div>}
            >
              <DropdownMenu
                items={[
                  ...(hasPermission(PERMISSIONS.ROLES_SHOW) ? [{
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleViewRole(role),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.ROLES_EDIT) ? [{
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => handleEditRole(role),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.ROLES_DELETE) ? [{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => handleDeleteRole(role),
                    className: 'text-red-600 hover:text-red-700',
                  }] : []),
                ]}
                trigger={<MoreVertical className="h-4 w-4" />}
                className="overflow-visible"
              />
            </PermissionGate>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        </div>

        <PermissionGate permission={PERMISSIONS.ROLES_CREATE}>
          <Button
            onClick={() => navigate("/roles/create")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Role</span>
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        data={roles || []}
        columns={tableColumns as any}
        isLoading={isLoading || isFetching || isRefreshing || isSearching}
        onPageChange={(page) => {
          if (page === currentPage) return; // Prevent duplicate calls
          setCurrentPage(page);
        }}
        onPageSizeChange={(pageSize) => {
          if (pageSize === currentPageSize) return; // Prevent duplicate calls
          setCurrentPage(1);
          setCurrentPageSize(pageSize);
        }}
        onSort={(field, direction) => {
          if (field === sortField && direction === sortDirection) return; // Prevent duplicate calls
          setSortField(field);
          setSortDirection(direction);
          setCurrentPage(1);
        }}
        onSearch={(field, value) => {
          // Clear previous timeout
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          
          // Set searching state
          setIsSearching(true);
          
          // Debounce search to prevent too many API calls
          searchTimeoutRef.current = setTimeout(() => {
            setSearchField(field);
            setSearchValue(value);
            setCurrentPage(1);
            // Don't clear searching state here - let React Query handle it
          }, 500); // 500ms debounce
        }}
        onClearSearch={() => {
          // Clear search timeout
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          
          setSearchField("name");
          setSearchValue("");
          setCurrentPage(1);
          setSortField("id");
          setSortDirection("desc");
        }}
        onRefresh={() => {
          // Set refreshing state
          setIsRefreshing(true);
          // Reset all filters and state to default
          setSearchValue("");
          setCurrentPage(1);
          setSortField("id");
          setSortDirection("desc");
          // Invalidate and refetch roles data with a slight delay to ensure state is updated
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['roles'] }).finally(() => {
              setIsRefreshing(false);
            });
          }, 0);
        }}
        currentPage={currentPage}
        pageSize={currentPageSize}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        itemName={deleteModal.role?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default RolesPage;
