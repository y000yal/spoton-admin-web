import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, DataTable, DeleteConfirmationModal, ActionButtons } from "../../components/UI";
import DynamicPermissionGate from "../../components/DynamicPermissionGate";
import { Plus, Users, Eye, Edit, Trash2, Loader2, RotateCcw } from "lucide-react";
import type { User } from "../../types";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import { userService } from "../../services/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../contexts/ToastContext";
import { useAppSelector } from "../../store/hooks";
import { useDynamicPermissions } from "../../hooks/useDynamicPermissions";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { hasPermission } = useDynamicPermissions();
  
  // Get current logged-in user
  const { user: currentLoggedInUser } = useAppSelector(state => state.auth);

  // Table state management
  const [searchField, setSearchField] = useState("username");
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
    user: User | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    user: null,
    isLoading: false
  });

  // Email verification loading state
  const [verificationLoading, setVerificationLoading] = useState<Record<number, boolean>>({});

  // Query parameters
  const queryParams = {
    page: currentPage,
    limit: currentPageSize,
    sort_field: sortField,
    sort_by: sortDirection,
    ...(searchValue && { [`filter[${searchField}]`]: searchValue }),
  };

  // React Query hooks
  const { data: users, isLoading, isFetching, error } = useUsers(queryParams);
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (users || error) {
      setIsSearching(false);
    }
  }, [users, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.user) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await deleteUserMutation.mutateAsync(deleteModal.user.id);
      
      // Show success message from API response
      showSuccess(
        response.message || 'User deleted successfully!',
        'User Deleted'
      );
      
      setDeleteModal({ isOpen: false, user: null, isLoading: false });
    } catch (error) {
      console.error("Failed to delete user:", error);
      showError('Failed to delete user', 'Delete Failed');
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, user: null, isLoading: false });
    }
  };

  const handleSendVerification = async (user: User) => {
    if (!user.email) return;

    setVerificationLoading(prev => ({ ...prev, [user.id]: true }));

    try {
      const response = await userService.resendVerificationOtp(user.email);
      
      showSuccess(
        response.message || 'Verification email sent successfully!',
        'Email Sent'
      );
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? String(err.message) 
        : 'Failed to send verification email';
      showError(errorMessage, 'Send Failed');
    } finally {
      setVerificationLoading(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const getStatusBadge = (status: string, user: User) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      "1": { label: "Active", className: "bg-green-100 text-green-800" },
      "0": { label: "Inactive", className: "bg-red-100 text-red-800" },
      "2": {
        label: "Email Pending",
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: "Unknown",
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
        {status === "2" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSendVerification(user);
            }}
            disabled={verificationLoading[user.id]}
            className={`p-1 rounded-full transition-colors ${
              verificationLoading[user.id]
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
            title="Resend verification email"
          >
            {verificationLoading[user.id] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    );
  };

  const tableColumns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      hideFromSearch: true, // Hide ID from search field dropdown
      render: (_: unknown, user: User) => user?.id || "N/A",
    },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
      render: (_: unknown, user: User) => {
        if (!user) return "N/A";
        if (typeof user.full_name === "object" && user.full_name !== null) {
          const { first_name, middle_name, last_name } = user.full_name;
          return `${first_name} ${
            middle_name ? middle_name + " " : ""
          }${last_name}`.trim();
        }
        return user.full_name || "N/A";
      },
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (_: unknown, user: User) => user?.email || "N/A",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_: unknown, user: User) => getStatusBadge(user?.status || "0", user),
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      render: (_: unknown, user: User) =>
        user?.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      hideFromSearch: true, // Hide Actions from search field dropdown
      render: (_: unknown, user: User) => {
        if (!user) return <div>N/A</div>;

        const primaryActions = [
          ...(hasPermission('user-show') ? [{
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewUser(user),
            permission: 'user-show'
          }] : []),
          ...(hasPermission('user-update') ? [{
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditUser(user),
            permission: 'user-update'
          }] : []),
          ...(hasPermission('user-destroy') && currentLoggedInUser && currentLoggedInUser.id !== user.id ? [{
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteUser(user),
            className: 'text-red-600 hover:text-red-700',
            permission: 'user-destroy'
          }] : []),
        ];

        return (
          <ActionButtons
            primaryActions={primaryActions}
            permissions={['user-show', 'user-update', 'user-destroy']}
            requireAll={false}
            fallback={<div className="w-8 h-8"></div>}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>

        <DynamicPermissionGate permission={'user-store'}>
          <Button
            onClick={() => navigate("/users/create")}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </DynamicPermissionGate>
      </div>

      <DataTable
        data={users || []}
        columns={tableColumns}
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
          
          setSearchField("username");
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
          // Invalidate and refetch users data with a slight delay to ensure state is updated
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['users'] }).finally(() => {
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
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        itemName={deleteModal.user?.username || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default UsersPage;
