import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from './UI';
import type { Media } from '../types';

interface ImagePreviewModalProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  media,
  isOpen,
  onClose,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const handleDownload = () => {
    if (media.url) {
      const link = document.createElement('a');
      link.href = media.url;
      link.download = media.title || `media-${media.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (media.url) {
      window.open(media.url, '_blank');
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out"
      style={{ 
        position: 'fixed',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full mx-4 transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-200 ease-in-out hover:scale-110"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Container */}
        <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl transform transition-all duration-300 ease-in-out">
          {/* Image */}
          <div className="relative">
            <img
              src={media.url}
              alt={media.title || 'Media preview'}
              className="w-full h-auto max-h-[80vh] object-contain transition-transform duration-300 ease-in-out"
              loading="lazy"
            />
          </div>

          {/* Image Info */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {media.title || 'Untitled'}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span className="uppercase">{media.type.split('/')[1]}</span>
                  <span>•</span>
                  <span>Uploaded {new Date(media.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center space-x-2 transition-all duration-200 ease-in-out hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="flex items-center space-x-2 transition-all duration-200 ease-in-out hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at the document body level
  return createPortal(modalContent, document.body);
};

export default ImagePreviewModal;
