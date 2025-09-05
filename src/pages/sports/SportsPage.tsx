import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Trophy,
  MoreVertical,
  Eye,
} from "lucide-react";
import type { Sport } from "../../types";
import {
  Button,
  DataTable,
  PermissionGate,
  DeleteConfirmationModal,
  DropdownMenu,
} from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";
import { useSports, useDeleteSport } from "../../hooks/useSports";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../hooks/usePermissionCheck";

const SportsPage: React.FC = () => {
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
    sport: Sport | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    sport: null,
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
  const { data: sports, isLoading, isFetching, error } = useSports(queryParams);
  const deleteSportMutation = useDeleteSport();
  const queryClient = useQueryClient();

  // Clear searching state when data changes
  useEffect(() => {
    if (sports || error) {
      setIsSearching(false);
    }
  }, [sports, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleViewSport = (sport: Sport) => {
    navigate(`/sports/${sport.id}`);
  };

  const handleEditSport = (sport: Sport) => {
    navigate(`/sports/${sport.id}/edit`);
  };

  const handleDeleteSport = (sport: Sport) => {
    setDeleteModal({
      isOpen: true,
      sport,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.sport) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await deleteSportMutation.mutateAsync(deleteModal.sport.id);
      setDeleteModal({ isOpen: false, sport: null, isLoading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, sport: null, isLoading: false });
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
      hideFromSearch: true, // Hide ID from search field dropdown
      render: (_: unknown, sport: Sport) => sport?.id || 'N/A'
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (_: unknown, sport: Sport) => sport?.name || 'N/A'
    },
    {
      key: 'sport_image',
      header: 'Image',
      sortable: false,
      hideFromSearch: true,
      render: (_: unknown, sport: Sport) => {
        if (sport?.media_url) {
          return (
            <img
              src={sport.media_url}
              alt={sport.name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-300"
            />
          );
        }
        return <span className="text-gray-400 text-sm">No image</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_: unknown, sport: Sport) => getStatusBadge(sport?.status || 'inactive')
    },
    {
      key: 'created_at',
      header: 'Created At',
      sortable: true,
      render: (_: unknown, sport: Sport) => sport?.created_at ? new Date(sport.created_at).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      hideFromSearch: true, // Hide Actions from search field dropdown
      render: (_: unknown, sport: Sport) => {
        if (!sport) return <div>N/A</div>;
        
        return (
          <div className="flex justify-end relative">
            <PermissionGate 
              permissions={[PERMISSIONS.SPORTS_SHOW, PERMISSIONS.SPORTS_EDIT, PERMISSIONS.SPORTS_DELETE]}
              requireAll={false}
              fallback={<div className="w-8 h-8"></div>}
            >
              <DropdownMenu
                items={[
                  ...(hasPermission(PERMISSIONS.SPORTS_SHOW) ? [{
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => handleViewSport(sport),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.SPORTS_EDIT) ? [{
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => handleEditSport(sport),
                  }] : []),
                  ...(hasPermission(PERMISSIONS.SPORTS_DELETE) ? [{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => handleDeleteSport(sport),
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
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Sports</h1>
        </div>
        
        <PermissionGate permission={PERMISSIONS.SPORTS_CREATE}>
          <Button
            onClick={() => navigate('/sports/create')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sport</span>
          </Button>
        </PermissionGate>
      </div>

      <DataTable
        data={sports || []}
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
          // Invalidate and refetch sports data with a slight delay to ensure state is updated
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['sports'] }).finally(() => {
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
        title="Delete Sport"
        message="Are you sure you want to delete this sport? This action cannot be undone."
        itemName={deleteModal.sport?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default SportsPage;
