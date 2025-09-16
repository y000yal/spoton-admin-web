import React, { useState, useRef, useEffect, useCallback } from "react";
import { Grid3X3, List, Upload } from "lucide-react";
import { Button, Modal } from "./UI";
import { useMedia, useCreateMedia } from "../hooks/useMedia";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";

interface MediaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaIds: number[]) => void;
  selectedMediaIds?: number[];
  selectionMode?: 'single' | 'multiple';
  allowAddNew?: boolean;
  title?: string;
}

type ViewMode = 'grid' | 'list';

const MediaSelectionModal: React.FC<MediaSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedMediaIds = [],
  selectionMode = 'multiple',
  allowAddNew = true,
  title = "Select Media"
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Table state management
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query used for API
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize] = useState(20);
  const [sortField] = useState("created_at");
  const [sortDirection] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedItems, setSelectedItems] = useState<number[]>(selectedMediaIds);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Query parameters
  const queryParams = {
    page: currentPage,
    limit: currentPageSize,
    sort_field: sortField,
    sort_order: sortDirection,
    ...(searchQuery && { [`filter[title]`]: searchQuery }),
  };

  // React Query hooks
  const { data: mediaData, isLoading, isFetching, error } = useMedia(queryParams);
  const createMediaMutation = useCreateMedia();

  // Update selected items when prop changes
  useEffect(() => {
    setSelectedItems(selectedMediaIds);
  }, [selectedMediaIds]);

  // Clear searching state when data changes
  useEffect(() => {
    if (mediaData || error) {
      setIsLoadingMore(false);
    }
  }, [mediaData, error]);


  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !mediaData || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && mediaData.current_page < mediaData.last_page) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [mediaData, isLoadingMore]);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleSelectItem = (id: number) => {
    if (selectionMode === 'single') {
      setSelectedItems([id]);
    } else {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    }
  };

  const handleSelectAll = () => {
    if (!userMedia || userMedia.length === 0) return;
    
    if (selectedItems.length === userMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(userMedia.map(item => item.id));
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearch = () => {
    setSearchQuery(searchValue);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
  };

  const handleUpload = async () => {
    if (!uploadFiles.length || !user?.id) return;

    setIsUploading(true);
    try {
      await createMediaMutation.mutateAsync({
        images: uploadFiles,
        user_id: user.id
      });
      
      showSuccess(`Successfully uploaded ${uploadFiles.length} media file(s)`);
      setUploadFiles([]);
      
      // Reset file input
      const fileInput = document.getElementById('media-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: unknown) {
      console.error('Error uploading media:', error);
      showError('Failed to upload media files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedItems);
    onClose();
  };

  const handleClose = () => {
    setSelectedItems(selectedMediaIds);
    setSearchValue("");
    setCurrentPage(1);
    setUploadFiles([]);
    onClose();
  };

  const media = mediaData?.data || [];
  
  // Show all media (admin can select from all media)
  const userMedia = media;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="full"
    >
      <div className="space-y-8">
        {/* Header Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="flex items-center space-x-3">
              {/* Search Input - Increased Width */}
              <div className="relative w-96 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search media by title..."
                  value={searchValue}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200 shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Action Buttons Container - Always Show Search */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Search Button - Always Visible */}
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchValue}
                  className={`px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md ${
                    searchValue 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Button>
                
                {/* Clear Button - Only when there's a search query */}
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSearch}
                    className="px-4 py-3 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            {/* Selection Info */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  {selectedItems.length} selected
                </span>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section - Minimized */}
        {allowAddNew && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  id="media-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="media-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors font-medium flex items-center space-x-2 text-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>Add Media</span>
                </label>
                {uploadFiles.length > 0 && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                    className="px-4 py-2"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length}`}
                  </Button>
                )}
              </div>
              {uploadFiles.length > 0 && (
                <div className="text-xs text-gray-500">
                  {uploadFiles.length} file(s) selected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Media Display */}
        <div 
          ref={scrollContainerRef}
          className="max-h-80 overflow-y-auto min-h-32"
        >
          {viewMode === 'grid' ? (
            <MediaGrid
              media={userMedia}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
              onPreview={() => {}} // Disable preview in modal
              isLoading={isLoading || isFetching}
              selectionMode={selectionMode}
            />
          ) : (
            <MediaList
              media={userMedia}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
              onPreview={() => {}} // Disable preview in modal
              isLoading={isLoading || isFetching}
              selectionMode={selectionMode}
            />
          )}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedItems.length > 0 && (
              <span>
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
            >
              Select {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaSelectionModal;
