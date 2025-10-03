import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  MapPin,
} from "lucide-react";
import type { Area } from "../../types";
import {
  Button,
  DataTable,
  PermissionGate,
  DeleteConfirmationModal,
  ActionButtons,
} from "../../components/UI";

import { useAreasByCenter, useDeleteArea } from "../../hooks/useAreas";
import { useCenter } from "../../hooks/useCenters";
import { useQueryClient } from "@tanstack/react-query";
import { useDynamicPermissions } from "../../hooks/useDynamicPermissions";

const AreasPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
  const { hasPermission } = useDynamicPermissions();

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
    area: Area | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    area: null,
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
  const { data: areasByCenter, isLoading: isLoadingByCenter, isFetching: isFetchingByCenter, error: areasError } = useAreasByCenter(parseInt(centerId || '0'), queryParams);
  const { data: center } = useCenter(parseInt(centerId || '0'));
  
  // We only support center-specific areas
  const areas = areasByCenter;
  const isLoading = isLoadingByCenter;
  const isFetching = isFetchingByCenter;

  // Redirect to centers page if no centerId is provided
  useEffect(() => {
    if (!centerId) {
      navigate('/centers');
    }
  }, [centerId, navigate]);
  const deleteAreaMutation = useDeleteArea();
  const queryClient = useQueryClient();

  // Clear searching state when data changes or when search parameters change
  useEffect(() => {
    if (areas) {
      setIsSearching(false);
    }
  }, [areas, searchValue, searchField]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewArea = (area: Area) => {
    navigate(`/centers/${centerId}/areas/${area.id}`);
  };

  const handleEditArea = (area: Area) => {
    navigate(`/centers/${centerId}/areas/${area.id}/edit`);
  };

  const handleDeleteArea = (area: Area) => {
    setDeleteModal({
      isOpen: true,
      area,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.area || !centerId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deleteAreaMutation.mutateAsync({ 
        centerId: parseInt(centerId), 
        areaId: deleteModal.area.id 
      });
      setDeleteModal({ isOpen: false, area: null, isLoading: false });
    } catch (error) {
      console.error('Error deleting area:', error);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, area: null, isLoading: false });
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
      render: (_: unknown, area: Area) => area?.id || 'N/A'
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_: unknown, area: Area) => area?.name || 'N/A'
    },
    {
      key: 'floor',
      header: 'Floor',
      sortable: true,
      render: (_: unknown, area: Area) => area?.floor || 'N/A'
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (_: unknown, area: Area) => {
        const description = area?.description || 'N/A';
        if (description === 'N/A') return description;
        return description.length > 50 
          ? `${description.substring(0, 50)}...` 
          : description;
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_: unknown, area: Area) => getStatusBadge(area?.status || 'inactive')
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      render: (_: unknown, area: Area) => area?.created_at ? new Date(area.created_at).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      hideFromSearch: true,
      render: (_: unknown, area: Area) => {
        if (!area) return <div>N/A</div>;
        
        const primaryActions = [
          ...(hasPermission('area-show') ? [{
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewArea(area),
            permission: 'area-show'
          }] : []),
          ...(hasPermission('area-update') ? [{
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditArea(area),
            permission: 'area-update'
          }] : []),
          ...(hasPermission('area-destroy') ? [{
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteArea(area),
            className: 'text-red-600 hover:text-red-700',
            permission: 'area-destroy'
          }] : []),
        ];

        return (
          <ActionButtons
            primaryActions={primaryActions}
            permissions={['area-show', 'area-update', 'area-destroy']}
            requireAll={false}
            fallback={<div className="w-8 h-8"></div>}
          />
        );
      }
    }
  ];


  // Show error if there's an issue loading data
  if (areasError) {
    console.error('Error loading areas:', areasError);
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Areas</h3>
        <p className="mt-1 text-sm text-gray-500">There was an error loading the areas for this center.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/centers')}>
            Back to Centers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/centers')}
            className="flex items-center space-x-1"
          >
            <Building2 className="h-4 w-4" />
            <span>Back to Centers</span>
          </Button>
         
        </div>
        
        <PermissionGate permission={'area-store'}>
          <Button
            onClick={() => navigate(`/centers/${centerId}/areas/create`)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Area</span>
          </Button>
        </PermissionGate>
      </div>

      {/* Center Context Info */}
      {center && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Areas in {center.name}
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                {areas?.data?.length || 0} area{(areas?.data?.length || 0) !== 1 ? 's' : ''} found
                {center.address && ` • ${center.address}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <DataTable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={areas?.data as any || []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            queryClient.invalidateQueries({ queryKey: ['areas'] }).finally(() => {
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
        title="Delete Area"
        message="Are you sure you want to delete this area? This action cannot be undone."
        itemName={deleteModal.area?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default AreasPage;
