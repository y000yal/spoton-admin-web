import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Key } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchPermissions,
  deletePermission,
} from "../../store/slices/permissionSlice";
import type { Permission } from "../../types";
import { Button, DataTable, PermissionGate, DeleteConfirmationModal } from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";

const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { permissions, isLoading } = useAppSelector(
    (state) => state.permissions
  );

  // Table state management
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLocalLoading, setIsLocalLoading] = useState(false);

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

  // Simple initial fetch
  React.useEffect(() => {
    dispatch(
      fetchPermissions({
        page: 1,
        limit: 10,
        sort_field: "created_at",
        sort_by: "desc",
      })
    );
  }, [dispatch]);

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
      await dispatch(deletePermission(deleteModal.permission.id)).unwrap();
      // Refresh the permissions list
      await dispatch(
        fetchPermissions({
          page: currentPage,
          limit: currentPageSize,
          sort_field: sortField,
          sort_by: sortDirection,
          forceRefresh: true,
        })
      );
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
      render: (_: unknown, permission: Permission) => {
        if (!permission) return <div>N/A</div>;

        return (
          <div className="flex space-x-2">
            <PermissionGate permission={PERMISSIONS.PERMISSIONS_SHOW}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewPermission(permission)}
                className="flex items-center space-x-1"
              >
                <Key className="h-4 w-4" />
                <span>View</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.PERMISSIONS_EDIT}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPermission(permission)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </PermissionGate>

            <PermissionGate permission={PERMISSIONS.PERMISSIONS_DELETE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePermission(permission)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
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
        data={permissions || ([] as any)}
        columns={tableColumns as any}
        isLoading={isLoading || isLocalLoading}
        onPageChange={(page) => {
          setCurrentPage(page);
          setIsLocalLoading(true);
          dispatch(
            fetchPermissions({
              page,
              limit: currentPageSize,
              sort_field: sortField,
              sort_by: sortDirection,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onPageSizeChange={(pageSize) => {
          setCurrentPage(1);
          setCurrentPageSize(pageSize);
          setIsLocalLoading(true);
          dispatch(
            fetchPermissions({
              page: 1,
              limit: pageSize,
              sort_field: sortField,
              sort_by: sortDirection,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onSort={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
          setCurrentPage(1);
          setIsLocalLoading(true);
          dispatch(
            fetchPermissions({
              page: 1,
              limit: currentPageSize,
              sort_field: field,
              sort_by: direction,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onSearch={(field, value) => {
          setSearchField(field);
          setSearchValue(value);
          setCurrentPage(1);
          setIsLocalLoading(true);
          const params: any = {
            page: 1,
            limit: currentPageSize,
            sort_field: sortField,
            sort_by: sortDirection,
          };
          if (value.trim()) {
            params[`filter[${field}]`] = value.trim();
          }
          dispatch(fetchPermissions(params)).finally(() =>
            setIsLocalLoading(false)
          );
        }}
        onClearSearch={() => {
          setSearchField("name");
          setSearchValue("");
          setCurrentPage(1);
          setSortField("created_at");
          setSortDirection("desc");
          setIsLocalLoading(true);
          dispatch(
            fetchPermissions({
              page: 1,
              limit: currentPageSize,
              sort_field: "created_at",
              sort_by: "desc",
              forceRefresh: true,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        onRefresh={() => {
          setIsLocalLoading(true);
          dispatch(
            fetchPermissions({
              page: currentPage,
              limit: currentPageSize,
              sort_field: sortField,
              sort_by: sortDirection,
              forceRefresh: true,
            })
          ).finally(() => setIsLocalLoading(false));
        }}
        searchField={searchField}
        searchValue={searchValue}
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
