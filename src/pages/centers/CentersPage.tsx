import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Eye,
  MapPin,
} from "lucide-react";
import type { Center } from "../../types";
import {
  Button,
  DataTable,
  PermissionGate,
  DeleteConfirmationModal,
  ActionButtons,
} from "../../components/UI";

import { useCenters, useDeleteCenter } from "../../hooks/useCenters";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../hooks/usePermissionCheck";

const CentersPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Table state management
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    center: Center | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    center: null,
    isLoading: false
  });

  // Refs to track API calls
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Loading state for refresh and search
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Query parameters
  const queryParams = {
    page: currentPage,
    limit: currentPageSize,
    sort_field: sortField,
    sort_by: sortDirection,
    ...(searchValue && { [`filter[${searchField}]`]: searchValue }),
  };

  // React Query hooks
  const { data: centers, isLoading, isFetching, error } = useCenters(queryParams);
  const deleteCenterMutation = useDeleteCenter();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (centers || error) {
      setIsSearching(false);
    }
  }, [centers, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewCenter = (center: Center) => {
    navigate(`/centers/${center.id}`);
  };

  const handleEditCenter = (center: Center) => {
    navigate(`/centers/${center.id}/edit`);
  };

  const handleDeleteCenter = (center: Center) => {
    setDeleteModal({
      isOpen: true,
      center,
      isLoading: false
    });
  };

  const handleViewAreas = (center: Center) => {
    navigate(`/centers/${center.id}/areas`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.center) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deleteCenterMutation.mutateAsync(deleteModal.center.id);
      setDeleteModal({ isOpen: false, center: null, isLoading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, center: null, isLoading: false });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'active': { label: 'Active', className: 'bg-green-100 text-green-800' },
      'inactive': { label: 'Inactive', className: 'bg-red-100 text-red-800' },
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
      sortable: true,
      hideFromSearch: true,
      render: (_: unknown, center: Center) => center?.id || 'N/A'
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_: unknown, center: Center) => center?.name || 'N/A'
    },
    {
      key: 'country',
      header: 'Country',
      sortable: true,
      render: (_: unknown, center: Center) => center?.country?.name || 'N/A'
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (_: unknown, center: Center) => center?.address || 'N/A'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_: unknown, center: Center) => getStatusBadge(center?.status || 'inactive')
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      render: (_: unknown, center: Center) => center?.created_at ? new Date(center.created_at).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      hideFromSearch: true,
      render: (_: unknown, center: Center) => {
        if (!center) return <div>N/A</div>;
        
        const primaryActions = [
          ...(hasPermission('center-show') ? [{
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewCenter(center),
            permission: 'center-show'
          }] : []),
          ...(hasPermission('center-update') ? [{
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditCenter(center),
            permission: 'center-update'
          }] : []),
          ...(hasPermission('area-index') ? [{
            label: 'View Areas',
            icon: <MapPin className="h-4 w-4" />,
            onClick: () => handleViewAreas(center),
            permission: 'area-index'
          }] : []),
          ...(hasPermission('center-destroy') ? [{
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteCenter(center),
            className: 'text-red-600 hover:text-red-700',
            permission: 'center-destroy'
          }] : [])
        ];

        return (
          <ActionButtons
            primaryActions={primaryActions}
            permissions={['center-show', 'center-update', 'center-destroy', 'area-index']}
            requireAll={false}
            fallback={<div className="w-8 h-8"></div>}
          />
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Centers</h1>
        </div>
        
        <PermissionGate permission={'center-store'}>
          <Button
            onClick={() => navigate('/centers/create')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Center</span>
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        data={centers || []}
        columns={tableColumns as any}
        isLoading={isLoading || isFetching || isRefreshing || isSearching}
        onPageChange={(page) => {
          if (page === currentPage) return;
          setCurrentPage(page);
        }}
        onPageSizeChange={(pageSize) => {
          if (pageSize === currentPageSize) return;
          setCurrentPage(1);
          setCurrentPageSize(pageSize);
        }}
        onSort={(field, direction) => {
          if (field === sortField && direction === sortDirection) return;
          setSortField(field);
          setSortDirection(direction);
          setCurrentPage(1);
        }}
        onSearch={(field, value) => {
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          
          setIsSearching(true);
          
          searchTimeoutRef.current = setTimeout(() => {
            setSearchField(field);
            setSearchValue(value);
            setCurrentPage(1);
          }, 500);
        }}
        onClearSearch={() => {
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
          setIsRefreshing(true);
          setSearchValue("");
          setCurrentPage(1);
          setSortField("id");
          setSortDirection("desc");
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['centers'] }).finally(() => {
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
        title="Delete Center"
        message="Are you sure you want to delete this center? This action cannot be undone."
        itemName={deleteModal.center?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default CentersPage;
