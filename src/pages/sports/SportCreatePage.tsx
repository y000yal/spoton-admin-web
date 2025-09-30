import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, MediaSelectionModal } from '../../components/UI';
import { ArrowLeft, Trophy, Image as ImageIcon } from 'lucide-react';
import type { CreateSportRequest } from '../../types';
import { useCreateSport } from '../../hooks/useSports';
import { useQueryClient } from '@tanstack/react-query';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useMedia } from '../../hooks/useMedia';

const SportCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreateSportRequest>({
    name: '',
    description: '',
    status: 'active',
    media_ids: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  
  // Fetch selected media details for preview
  const { data: selectedMediaData } = useMedia({
    limit: selectedMediaIds.length,
    page: 1,
    filter_field: 'id',
    filter_value: selectedMediaIds.join(','),
  });
  
  // Use the form validation hook
  const {
    errors,
    validationErrors,
    clearFieldError,
    handleApiError,
    getFieldError,
    hasFieldError,
  } = useFormValidation();

  // Ref to prevent duplicate form submissions
  const isSubmittingRef = useRef(false);

  // React Query hooks
  const createSportMutation = useCreateSport();
  const queryClient = useQueryClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    clearFieldError(name);
  };


  const validateForm = (): boolean => {
    // Only basic validation - let backend handle detailed validation
    return formData.name.trim().length > 0 && formData.status.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      await createSportMutation.mutateAsync(formData);
      
      // Invalidate and refetch the sports list data to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["sports"] });
      
      // Wait for the invalidation to complete and data to be refetched
      await queryClient.refetchQueries({ queryKey: ["sports"] });
      
      // Only navigate after data is fully updated
      navigate('/sports');
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigate('/sports');
  };

  const handleMediaSelect = (mediaIds: number[]) => {
    setSelectedMediaIds(mediaIds);
    // Update form data with selected media IDs
    setFormData(prev => ({
      ...prev,
      media_ids: mediaIds
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/sports')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create Sport</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="sport-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                <span>Create Sport</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <form id="sport-form" onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError('name') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sport name"
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError('description') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sport description"
                  />
                  {getFieldError('description') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError('status') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {getFieldError('status') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('status')}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

              </div>
            </form>
          </Card>
        </div>

        {/* Media Selection Section */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Sport Image
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaModal(true)}
                  className="flex items-center space-x-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Select from Library</span>
                </Button>
              </div>
              
              {selectedMediaIds.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {selectedMediaIds.length} image(s) selected
                  </div>
                  
                  {/* Selected Images Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedMediaData?.data?.map((media) => (
                      <div key={media.id} className="relative group">
                        <img
                          src={media.url}
                          alt={media.title || 'Selected image'}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSelectedIds = selectedMediaIds.filter(id => id !== media.id);
                            setSelectedMediaIds(newSelectedIds);
                            setFormData(prev => ({
                              ...prev,
                              images: newSelectedIds
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">No image selected</p>
                  <p className="text-xs text-gray-500">
                    Click "Select from Library" to choose an image
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Media Selection Modal */}
      <MediaSelectionModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        selectedMediaIds={selectedMediaIds}
        selectionMode="single"
        allowAddNew={true}
        title="Select Sport Image"
      />
    </div>
  );
};

export default SportCreatePage;
