import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  MoreVertical,
  Eye,
  Building2,
} from "lucide-react";
import type { Area } from "../../types";
import {
  Button,
  DataTable,
  PermissionGate,
  DeleteConfirmationModal,
  DropdownMenu,
} from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";
import { useAreas, useAreasByCenter, useDeleteArea } from "../../hooks/useAreas";
import { useCenter } from "../../hooks/useCenters";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../hooks/usePermissionCheck";

const AreasPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
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
  const isCenterSpecific = !!centerId;
  const { data: areasByCenter, isLoading: isLoadingByCenter, isFetching: isFetchingByCenter } = useAreasByCenter(parseInt(centerId || '0'), queryParams);
  const { data: allAreas, isLoading: isLoadingAll, isFetching: isFetchingAll } = useAreas(queryParams);
  const { data: center } = useCenter(parseInt(centerId || '0'));
  
  // Use the appropriate data based on context
  const areas = isCenterSpecific ? areasByCenter : allAreas;
  const isLoading = isCenterSpecific ? isLoadingByCenter : isLoadingAll;
  const isFetching = isCenterSpecific ? isFetchingByCenter : isFetchingAll;
  const deleteAreaMutation = useDeleteArea();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (areas) {
      setIsSearching(false);
    }
  }, [areas]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewArea = (area: Area) => {
    if (isCenterSpecific) {
      navigate(`/centers/${centerId}/areas/${area.id}`);
    } else {
      // For general areas, we need to find the center ID from the area data
      // This assumes the area has a center_id field
      navigate(`/centers/${area.center_id}/areas/${area.id}`);
    }
  };

  const handleEditArea = (area: Area) => {
    if (isCenterSpecific) {
      navigate(`/centers/${centerId}/areas/${area.id}/edit`);
    } else {
      // For general areas, we need to find the center ID from the area data
      navigate(`/centers/${area.center_id}/areas/${area.id}/edit`);
    }
  };

  const handleDeleteArea = (area: Area) => {
    setDeleteModal({
      isOpen: true,
      area,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.area) return;

    const areaCenterId = isCenterSpecific ? parseInt(centerId!) : deleteModal.area.center_id;
    if (!areaCenterId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deleteAreaMutation.mutateAsync({ 
        centerId: areaCenterId, 
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
    // Add center column only when viewing all areas (not center-specific)
    ...(!isCenterSpecific ? [{
      key: 'center',
      header: 'Center',
      sortable: true,
      render: (_: unknown, area: Area) => {
        // This assumes the area has a center_id and we need to find the center name
        // For now, we'll show the center_id, but ideally this would be populated from the API
        return area?.center_id ? `Center ${area.center_id}` : 'N/A';
      }
    }] : []),
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
      render: (_: unknown, area: Area) => area?.description || 'N/A'
    },
    {
      key: 'media',
      header: 'Images',
      sortable: false,
      hideFromSearch: true,
      render: (_: unknown, area: Area) => {
        if (area?.media && area.media.length > 0) {
          return (
            <div className="flex space-x-1">
              {area.media.slice(0, 3).map((media, index) => (
                <img
                  key={index}
                  src={media.url}
                  alt={media.title}
                  className="w-8 h-8 object-cover rounded border border-gray-300"
                />
              ))}
              {area.media.length > 3 && (
                <div className="w-8 h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                  +{area.media.length - 3}
                </div>
              )}
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">No images</span>;
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
        
        return (
          <div className="flex justify-end relative">
            <PermissionGate 
              permissions={[PERMISSIONS.AREAS_SHOW, PERMISSIONS.AREAS_EDIT, PERMISSIONS.AREAS_DELETE]}
              requireAll={false}
              fallback={<div className="w-8 h-8"></div>}
            >
              <DropdownMenu
                items={[
                  ...(hasPermission(PERMISSIONS.AREAS_SHOW) ? [{
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleViewArea(area),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.AREAS_EDIT) ? [{
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => handleEditArea(area),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.AREAS_DELETE) ? [{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => handleDeleteArea(area),
                    className: 'text-red-600 hover:text-red-700',
                  }] : []),
                ]}
                trigger={<MoreVertical className="h-4 w-4" />}
                className="overflow-visible"
              />
            </PermissionGate>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {isCenterSpecific && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/centers')}
              className="flex items-center space-x-1"
            >
              <Building2 className="h-4 w-4" />
              <span>Back to Centers</span>
            </Button>
          )}
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCenterSpecific ? 'Areas' : 'All Areas'}
            </h1>
            {isCenterSpecific && center ? (
              <div className="mt-1">
                <p className="text-sm text-gray-500">
                  in <span className="font-semibold text-gray-700">{center.name}</span>
                </p>
                {center.address && (
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {center.address}
                  </p>
                )}
                {center.country && (
                  <p className="text-xs text-gray-400">
                    🌍 {center.country.name}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                {isCenterSpecific ? 'Loading center information...' : 'Viewing all areas across all centers'}
              </p>
            )}
          </div>
        </div>
        
        <PermissionGate permission={PERMISSIONS.AREAS_CREATE}>
          <Button
            onClick={() => navigate(isCenterSpecific ? `/centers/${centerId}/areas/create` : '/areas/create')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Area</span>
          </Button>
        </PermissionGate>
      </div>

      {/* Center Context Info */}
      {isCenterSpecific && center && (
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
