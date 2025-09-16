import React from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import type { Media } from '../types';

interface MediaGridProps {
  media: Media[];
  selectedItems: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: () => void;
  onPreview: (media: Media) => void;
  isLoading?: boolean;
  selectionMode?: 'single' | 'multiple';
}

const MediaGrid: React.FC<MediaGridProps> = ({
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className={`group relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
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
              className={`absolute top-2 left-2 z-10 flex items-center justify-center w-4 h-4 rounded border-2 transition-colors ${
                selectedItems.includes(item.id)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              {selectedItems.includes(item.id) && <Check className="h-2.5 w-2.5" />}
            </button>

            {/* Media Preview */}
            <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="p-2">
              <div className="flex items-center space-x-1 mb-1">
                {getFileTypeIcon(item.type)}
                <span className="text-xs text-gray-500 uppercase">{item.type.split('/')[1]}</span>
              </div>
              
              <h3 className="font-medium text-gray-900 truncate text-xs" title={item.title}>
                {item.title || 'Untitled'}
              </h3>
              
              <p className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
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

export default MediaGrid;
