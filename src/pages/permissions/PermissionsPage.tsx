import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Key, MoreVertical, Eye } from "lucide-react";
import type { Permission } from "../../types";
import { Button, DataTable, PermissionGate, DeleteConfirmationModal, DropdownMenu } from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";
import { usePermissions, useDeletePermission } from "../../hooks/usePermissions";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions as usePermissionCheck } from "../../hooks/usePermissionCheck";

const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissionCheck();

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
    permission: Permission | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    permission: null,
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
  const { data: permissions, isLoading, isFetching, error } = usePermissions(queryParams);
  const deletePermissionMutation = useDeletePermission();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (permissions || error) {
      setIsSearching(false);
    }
  }, [permissions, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewPermission = (permission: Permission) => {
    navigate(`/permissions/${permission.id}`);
  };

  const handleEditPermission = (permission: Permission) => {
    navigate(`/permissions/${permission.id}/edit`);
  };

  const handleDeletePermission = (permission: Permission) => {
    setDeleteModal({
      isOpen: true,
      permission,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.permission) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deletePermissionMutation.mutateAsync(deleteModal.permission.id);
      setDeleteModal({ isOpen: false, permission: null, isLoading: false });
    } catch (error) {
      console.error("Failed to delete permission:", error);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, permission: null, isLoading: false });
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
      render: (_: unknown, permission: Permission) => permission?.id || "N/A",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (_: unknown, permission: Permission) => permission?.name || "N/A",
    },
    {
      key: "display_name",
      header: "Display Name",
      sortable: true,
      render: (_: unknown, permission: Permission) =>
        permission?.display_name || "N/A",
    },
    {
      key: "slug",
      header: "Slug",
      sortable: true,
      render: (_: unknown, permission: Permission) => permission?.slug || "N/A",
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (_: unknown, permission: Permission) =>
        permission?.created_at
          ? new Date(permission.created_at).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      hideFromSearch: true, // Hide Actions from search field dropdown
      render: (_: unknown, permission: Permission) => {
        if (!permission) return <div>N/A</div>;

        return (
          <div className="flex justify-end relative">
            <PermissionGate 
              permissions={[PERMISSIONS.PERMISSIONS_SHOW, PERMISSIONS.PERMISSIONS_EDIT, PERMISSIONS.PERMISSIONS_DELETE]}
              requireAll={false}
              fallback={<div className="w-8 h-8"></div>}
            >
              <DropdownMenu
                items={[
                  ...(hasPermission(PERMISSIONS.PERMISSIONS_SHOW) ? [{
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleViewPermission(permission),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.PERMISSIONS_EDIT) ? [{
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => handleEditPermission(permission),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.PERMISSIONS_DELETE) ? [{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => handleDeletePermission(permission),
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
          <Key className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
        </div>

        <PermissionGate permission={PERMISSIONS.PERMISSIONS_CREATE}>
          <Button
            onClick={() => navigate("/permissions/create")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Permission</span>
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        data={permissions || []}
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
          // Invalidate and refetch permissions data with a slight delay to ensure state is updated
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] }).finally(() => {
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
        title="Delete Permission"
        message="Are you sure you want to delete this permission? This action cannot be undone."
        itemName={deleteModal.permission?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default PermissionsPage;
