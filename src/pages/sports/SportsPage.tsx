import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Trophy,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchSports,
  deleteSport,
} from "../../store/slices/sportSlice";
import type { Sport } from "../../types";
import {
  Button,
  DataTable,
  PermissionGate,
  DeleteConfirmationModal,
} from "../../components/UI";
import { PERMISSIONS } from "../../utils/permissions";

const SportsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sports, isLoading } = useAppSelector((state) => state.sports);

  // Table state management
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLocalLoading, setIsLocalLoading] = useState(false);

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
  const initialFetchRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch - only once
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      dispatch(fetchSports({ page: 1, limit: 10, sort_field: 'name', sort_by: 'desc' }));
    }
  }, [dispatch]);

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
      await dispatch(deleteSport(deleteModal.sport.id)).unwrap();
      // Refresh the sports list
      await dispatch(fetchSports({ page: currentPage, limit: currentPageSize, sort_field: sortField, sort_by: sortDirection, forceRefresh: true }));
      setDeleteModal({ isOpen: false, sport: null, isLoading: false });
    } catch (error) {
      console.error('Failed to delete sport:', error);
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
      render: (_: unknown, sport: Sport) => {
        if (!sport) return <div>N/A</div>;
        
        return (
          <div className="flex space-x-2">
            <PermissionGate permission={PERMISSIONS.SPORTS_SHOW}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewSport(sport)}
                className="flex items-center space-x-1"
              >
                <Trophy className="h-4 w-4" />
                <span>View</span>
              </Button>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.SPORTS_EDIT}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditSport(sport)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </PermissionGate>
            
            <PermissionGate permission={PERMISSIONS.SPORTS_DELETE}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteSport(sport)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
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
        data={sports || ([] as any)}
        columns={tableColumns as any}
        isLoading={isLoading || isLocalLoading}
        onPageChange={(page) => {
          if (page === currentPage) return; // Prevent duplicate calls
          setCurrentPage(page);
          setIsLocalLoading(true);
          dispatch(fetchSports({ page, limit: currentPageSize, sort_field: sortField, sort_by: sortDirection }))
            .finally(() => setIsLocalLoading(false));
        }}
        onPageSizeChange={(pageSize) => {
          if (pageSize === currentPageSize) return; // Prevent duplicate calls
          setCurrentPage(1);
          setCurrentPageSize(pageSize);
          setIsLocalLoading(true);
          dispatch(fetchSports({ page: 1, limit: pageSize, sort_field: sortField, sort_by: sortDirection }))
            .finally(() => setIsLocalLoading(false));
        }}
        onSort={(field, direction) => {
          if (field === sortField && direction === sortDirection) return; // Prevent duplicate calls
          setSortField(field);
          setSortDirection(direction);
          setCurrentPage(1);
          setIsLocalLoading(true);
          dispatch(fetchSports({ page: 1, limit: currentPageSize, sort_field: field, sort_by: direction }))
            .finally(() => setIsLocalLoading(false));
        }}
        onSearch={(field, value) => {
          // Clear previous timeout
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
          }
          
          // Debounce search to prevent too many API calls
          searchTimeoutRef.current = setTimeout(() => {
            setSearchField(field);
            setSearchValue(value);
            setCurrentPage(1);
            setIsLocalLoading(true);
            const params: any = { page: 1, limit: currentPageSize, sort_field: sortField, sort_by: sortDirection };
            if (value.trim()) {
              params[`filter[${field}]`] = value.trim();
            }
            dispatch(fetchSports(params))
              .finally(() => setIsLocalLoading(false));
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
          setSortField("name");
          setSortDirection("desc");
          setIsLocalLoading(true);
          dispatch(fetchSports({ page: 1, limit: currentPageSize, sort_field: 'name', sort_by: 'desc', forceRefresh: true }))
            .finally(() => setIsLocalLoading(false));
        }}
        onRefresh={() => {
          setIsLocalLoading(true);
          dispatch(fetchSports({ page: currentPage, limit: currentPageSize, sort_field: sortField, sort_by: sortDirection, forceRefresh: true }))
            .finally(() => setIsLocalLoading(false));
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
        title="Delete Sport"
        message="Are you sure you want to delete this sport? This action cannot be undone."
        itemName={deleteModal.sport?.name || ''}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default SportsPage;
