import React from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import type { Media } from '../types';

interface MediaListProps {
  media: Media[];
  selectedItems: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: () => void;
  onPreview: (media: Media) => void;
  isLoading?: boolean;
  selectionMode?: 'single' | 'multiple';
}

const MediaList: React.FC<MediaListProps> = ({
  media,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onPreview,
  isLoading = false,
  selectionMode = 'multiple',
}) => {
  const allSelected = media.length > 0 && selectedItems.length === media.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < media.length;

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <ImageIcon className="h-4 w-4" />;
  };

  // const formatFileSize = (bytes: number) => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All Header - Only show for multiple selection mode */}
      {selectionMode === 'multiple' && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={onSelectAll}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                allSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : someSelected
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {allSelected && <Check className="h-3 w-3" />}
              {someSelected && !allSelected && <Check className="h-3 w-3" />}
            </button>
            <span className="text-sm font-medium text-gray-700">
              {selectedItems.length > 0
                ? `${selectedItems.length} of ${media.length} selected`
                : `Select all ${media.length} items`}
            </span>
          </div>
        </div>
      )}

      {/* Media List */}
      <div className="space-y-2">
        {media.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center space-x-3 p-3 bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
              selectedItems.includes(item.id)
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onPreview(item)}
          >
            {/* Selection Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.id);
              }}
              className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors ${
                selectedItems.includes(item.id)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {selectedItems.includes(item.id) && <Check className="h-2.5 w-2.5" />}
            </button>

            {/* Media Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getFileTypeIcon(item.type)}
                <span className="text-xs text-gray-500 uppercase">{item.type.split('/')[1]}</span>
              </div>
              
              <h3 className="font-medium text-gray-900 truncate text-sm" title={item.title}>
                {item.title || 'Untitled'}
              </h3>
              
              <p className="text-xs text-gray-500">
                Uploaded on {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-500">Upload some media to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MediaList;
