import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Grid3X3,
  List,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import type { Media } from "../../types";
import {
  Button,
  PermissionGate,
  DeleteConfirmationModal,
} from "../../components/UI";

import { useMedia, useDeleteMedia, useDeleteMultipleMedia } from "../../hooks/useMedia";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../hooks/usePermissionCheck";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import MediaGrid from "../../components/MediaGrid";
import MediaList from "../../components/MediaList";
import ImagePreviewModal from "../../components/ImagePreviewModal";

type ViewMode = 'grid' | 'list';

const MediaPage: React.FC = () => {
  const navigate = useNavigate();
  usePermissions();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Table state management
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize] = useState(20);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    media: Media | null;
    isMultiple: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    media: null,
    isMultiple: false,
    isLoading: false
  });

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    media: Media | null;
  }>({
    isOpen: false,
    media: null
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
    sort_order: sortDirection,
    ...(searchValue && { [`filter[title]`]: searchValue }),
  };

  // React Query hooks
  const { data: mediaData, isLoading, isFetching, error } = useMedia(queryParams);
  const deleteMediaMutation = useDeleteMedia();
  const deleteMultipleMediaMutation = useDeleteMultipleMedia();
  const queryClient = useQueryClient();

  // Debug media data and warning conditions
  React.useEffect(() => {
    console.log('=== MEDIA PAGE STATE DEBUG ===');
    console.log('isLoading:', isLoading);
    console.log('isFetching:', isFetching);
    console.log('isRefreshing:', isRefreshing);
    console.log('isSearching:', isSearching);
    console.log('error:', error);
    console.log('mediaData:', mediaData);
    console.log('user?.id:', user?.id);
    
    if (mediaData && mediaData.data) {
      console.log('Total media items from API:', mediaData.data.length);
      const userOwnedMedia = mediaData.data.filter(item => item.user_id === user?.id);
      console.log('User owned media count:', userOwnedMedia.length);
    }
    console.log('=== END STATE DEBUG ===');
  }, [isLoading, isFetching, isRefreshing, isSearching, error, mediaData, user?.id]);

  // Clear searching state when data changes
  useEffect(() => {
    if (mediaData || error) {
      setIsSearching(false);
    }
  }, [mediaData, error]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Clear selection when data changes
  useEffect(() => {
    setSelectedItems([]);
  }, [mediaData]);

  const handlePreviewMedia = (media: Media) => {
    setPreviewModal({
      isOpen: true,
      media: media
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      media: null
    });
  };


  const handleDeleteMultiple = () => {
    if (selectedItems.length === 0) return;
    
    console.log('Selected items for deletion:', selectedItems);
    console.log('Current user ID:', user?.id);
    
    setDeleteModal({
      isOpen: true,
      media: null,
      isMultiple: true,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.isMultiple) {
      if (selectedItems.length === 0) return;
      
      setDeleteModal(prev => ({ ...prev, isLoading: true }));
      
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        const response = await deleteMultipleMediaMutation.mutateAsync({ 
          mediaIds: selectedItems, 
          userId: user.id 
        });
        
        console.log('Bulk delete response:', response);
        
        // Show success message based on response
        if (response.count > 0) {
          showSuccess(`Successfully deleted ${response.count} media files`);
        } else {
          showWarning('No media files were deleted');
        }
        
        setDeleteModal({ isOpen: false, media: null, isMultiple: false, isLoading: false });
        setSelectedItems([]);
      } catch (error: unknown) {
        console.error('Error deleting media:', error);
        
        // Handle validation errors
        if (error && typeof error === 'object' && 'response' in error) {
          const errorResponse = error.response as { data?: { message?: unknown } };
          if (errorResponse?.data?.message) {
            const errorMessage = errorResponse.data.message;
            if (typeof errorMessage === 'object') {
              // Handle validation errors with field-specific messages
              const validationErrors = Object.entries(errorMessage)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n');
              showError(`Validation Error: ${validationErrors}`);
            } else {
              showError(`Error: ${errorMessage}`);
            }
          } else {
            showError('An error occurred while deleting media');
          }
        } else {
          showError('An error occurred while deleting media');
        }
        
        setDeleteModal(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      if (!deleteModal.media) return;

      setDeleteModal(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await deleteMediaMutation.mutateAsync(deleteModal.media.id);
        console.log('Single delete response:', response);
        showSuccess(`Successfully deleted media: ${deleteModal.media.title}`);
        setDeleteModal({ isOpen: false, media: null, isMultiple: false, isLoading: false });
      } catch (error: unknown) {
        console.error('Error deleting single media:', error);
        
        // Handle validation errors
        if (error && typeof error === 'object' && 'response' in error) {
          const errorResponse = error.response as { data?: { message?: unknown } };
          if (errorResponse?.data?.message) {
            const errorMessage = errorResponse.data.message;
            if (typeof errorMessage === 'object') {
              // Handle validation errors with field-specific messages
              const validationErrors = Object.entries(errorMessage)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('\n');
              showError(`Validation Error: ${validationErrors}`);
            } else {
              showError(`Error: ${errorMessage}`);
            }
          } else {
            showError('An error occurred while deleting media');
          }
        } else {
          showError('An error occurred while deleting media');
        }
        
        setDeleteModal(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteModal.isLoading) {
      setDeleteModal({ isOpen: false, media: null, isMultiple: false, isLoading: false });
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!userMedia || userMedia.length === 0) return;
    
    if (selectedItems.length === userMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(userMedia.map(item => item.id));
    }
  };

  const handleSearch = (value: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set searching state
    setIsSearching(true);
    
    // Debounce search to prevent too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      setSearchValue(value);
      setCurrentPage(1);
    }, 500);
  };

  // const handleClearSearch = () => {
  //   // Clear search timeout
  //   if (searchTimeoutRef.current) {
  //     clearTimeout(searchTimeoutRef.current);
  //   }
    
  //   setSearchField("title");
  //   setSearchValue("");
  //   setCurrentPage(1);
  //   setSortField("created_at");
  //   setSortDirection("desc");
  // };

  const handleRefresh = () => {
    // Set refreshing state
    setIsRefreshing(true);
    // Reset all filters and state to default
    setSearchValue("");
    setCurrentPage(1);
    setSortField("created_at");
    setSortDirection("desc");
    setSelectedItems([]);
    // Invalidate and refetch media data with a slight delay to ensure state is updated
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['media'] }).finally(() => {
        setIsRefreshing(false);
      });
    }, 0);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
  };

  // const handlePageSizeChange = (pageSize: number) => {
  //   if (pageSize === currentPageSize) return;
  //   setCurrentPage(1);
  //   setCurrentPageSize(pageSize);
  // };

  // const handleSort = (field: string, direction: 'asc' | 'desc') => {
  //   if (field === sortField && direction === sortDirection) return;
  //   setSortField(field);
  //   setSortDirection(direction);
  //   setCurrentPage(1);
  // };

  const media = mediaData?.data || [];
  
  // Check if user is admin
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';
  
  // Filter media: show all media for admin users, only user's own media for regular users
  const userMedia = isAdmin ? media : (user?.id ? media.filter(item => item.user_id === user.id) : []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ImageIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <PermissionGate permission={'media-store'}>
            <Button
              onClick={() => navigate('/media/create')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Media</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search media by title..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-3">
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <PermissionGate permission={'media-destroy'}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteMultiple}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </PermissionGate>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>


      {/* Media Display */}
      {viewMode === 'grid' ? (
        <MediaGrid
          media={userMedia}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onPreview={handlePreviewMedia}
          isLoading={isLoading || isFetching || isRefreshing || isSearching}
        />
      ) : (
        <MediaList
          media={userMedia}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onSelectAll={handleSelectAll}
          onPreview={handlePreviewMedia}
          isLoading={isLoading || isFetching || isRefreshing || isSearching}
        />
      )}

      {/* Pagination */}
      {mediaData && mediaData.total > currentPageSize && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= mediaData.last_page}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{mediaData.from}</span>
                {' '}to{' '}
                <span className="font-medium">{mediaData.to}</span>
                {' '}of{' '}
                <span className="font-medium">{mediaData.total}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {mediaData.last_page}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= mediaData.last_page}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.isMultiple ? "Delete Selected Media" : "Delete Media"}
        message={
          deleteModal.isMultiple
            ? `Are you sure you want to delete ${selectedItems.length} selected media items? This action cannot be undone.`
            : "Are you sure you want to delete this media item? This action cannot be undone."
        }
        itemName={deleteModal.media?.title || `${selectedItems.length} items`}
        isLoading={deleteModal.isLoading}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        media={previewModal.media}
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default MediaPage;
