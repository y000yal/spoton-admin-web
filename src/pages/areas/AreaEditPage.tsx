import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, MediaSelectionModal, SportSearchInput } from '../../components/UI';
import { ArrowLeft, MapPin, X, Image as ImageIcon } from 'lucide-react';
import type { UpdateAreaRequest, Sport } from '../../types';
import { useArea, useUpdateArea } from '../../hooks/useAreas';
import { useCenter } from '../../hooks/useCenters';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useMedia } from '../../hooks/useMedia';
import { useDynamicPermissions } from '../../hooks/useDynamicPermissions';
import AmenityMultiSelect from '../../components/AmenityMultiSelect';

const AreaEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId, areaId } = useParams<{ centerId: string; areaId: string }>();
  const { hasPermission } = useDynamicPermissions();
  
  const [formData, setFormData] = useState<UpdateAreaRequest>({
    name: '',
    status: 'active',
    description: '',
    floor: '',
    sport_id: undefined,
    media_ids: [],
    amenity_ids: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);

  // Use the form validation hook
  const {
    errors,
    validationErrors,
    clearFieldError,
    setClientErrors,
    handleApiError,
    getFieldError,
    hasFieldError,
  } = useFormValidation();

  // Refs to track API calls and prevent duplicates
  const isSubmittingRef = useRef(false);

  // React Query hooks
  const { data: currentArea, isLoading, error } = useArea(parseInt(centerId || '0'), parseInt(areaId || '0'));
  const { data: center } = useCenter(parseInt(centerId || '0'));
  const updateAreaMutation = useUpdateArea();
  
  // Fetch all media and filter by selected IDs
  const { data: allMediaData } = useMedia({
    page: 1,
    limit: 1000 // Get a large number to ensure we have all media
  });
  
  // Filter media by selected IDs
  const selectedMediaData = allMediaData?.data?.filter(media => 
    selectedMediaIds.includes(media.id)
  ) || [];

  // Update form data when area is loaded
  useEffect(() => {
    if (currentArea) {
      setFormData({
        name: currentArea.name || '',
        status: currentArea.status || 'active',
        description: currentArea.description || '',
        floor: currentArea.floor || '',
        sport_id: currentArea.sport_id
      });
      
      // Set existing sport if available
      if (currentArea.sport) {
        setSelectedSport(currentArea.sport);
      }
      
      // Set existing media if available
      if (currentArea.media && currentArea.media.length > 0) {
        const mediaIds = currentArea.media.map(media => media.media_id);
        setSelectedMediaIds(mediaIds);
        setFormData(prev => ({
          ...prev,
          media_ids: mediaIds
        }));
      }

      // Set existing amenities if available
      if (currentArea.amenity_ids && currentArea.amenity_ids.length > 0) {
        setSelectedAmenityIds(currentArea.amenity_ids);
        setFormData(prev => ({
          ...prev,
          amenity_ids: currentArea.amenity_ids
        }));
      } else if (currentArea.amenities && currentArea.amenities.length > 0) {
        // If amenities come as objects, extract the IDs
        const amenityIds = currentArea.amenities.map(amenity => amenity.id);
        setSelectedAmenityIds(amenityIds);
        setFormData(prev => ({
          ...prev,
          amenity_ids: amenityIds
        }));
      } else {
        setSelectedAmenityIds([]);
        setFormData(prev => ({
          ...prev,
          amenity_ids: []
        }));
      }
    }
  }, [currentArea]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    clearFieldError(name);
  };

  const handleSportSelect = (sport: Sport | null) => {
    setSelectedSport(sport);
    setFormData(prev => ({
      ...prev,
      sport_id: sport?.id
    }));
    clearFieldError('sport_id');
  };

  const handleMediaSelect = (mediaIds: number[]) => {
    setSelectedMediaIds(mediaIds);
    setFormData(prev => ({
      ...prev,
      media_ids: mediaIds
    }));
    console.log('Selected media IDs:', mediaIds);
  };

  const handleRemoveMedia = (mediaId: number) => {
    const newMediaIds = selectedMediaIds.filter(id => id !== mediaId);
    setSelectedMediaIds(newMediaIds);
    setFormData(prev => ({
      ...prev,
      media_ids: newMediaIds
    }));
  };

  const handleAmenityChange = (amenityIds: number[]) => {
    setSelectedAmenityIds(amenityIds);
    setFormData(prev => ({
      ...prev,
      amenity_ids: amenityIds
    }));
  };

  const validateForm = (): boolean => {
    return formData.name?.trim().length > 0 && 
           formData.floor?.trim().length > 0 &&
           formData.status?.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !centerId || !areaId) {
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      await updateAreaMutation.mutateAsync({ 
        centerId: parseInt(centerId), 
        areaId: parseInt(areaId),
        areaData: {
          ...formData,
          media_ids: selectedMediaIds,
          amenity_ids: selectedAmenityIds
        }
      });
      navigate(`/centers/${centerId}/areas`);
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigate(`/centers/${centerId}/areas`);
  };

  // Check if user has permission to update areas
  if (!hasPermission('area-update')) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have permission to edit areas.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(`/centers/${centerId}/areas`)}>
            Back to Areas
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentArea) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Area not found</h3>
        <p className="mt-1 text-sm text-gray-500">The area you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate(`/centers/${centerId}/areas`)}>
            Back to Areas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/centers/${centerId}/areas`)}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Area</h1>
            {center && (
              <p className="text-sm text-gray-500">in {center.name}</p>
            )}
          </div>
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
            form="area-form"
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Update Area</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <form id="area-form" onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('name') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter area name"
                    />
                    {getFieldError('name') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                      Floor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="floor"
                      name="floor"
                      value={formData.floor || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('floor') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter floor (e.g., Ground Floor, 1st Floor)"
                    />
                    {getFieldError('floor') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('floor')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError('description') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter area description"
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
                    value={formData.status || 'active'}
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

                <div>
                  <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <SportSearchInput
                    selectedSport={selectedSport}
                    onSportSelect={handleSportSelect}
                    placeholder="Search for a sport..."
                    disabled={isSubmitting}
                  />
                  {getFieldError('sport_id') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('sport_id')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <AmenityMultiSelect
                    selectedAmenityIds={selectedAmenityIds}
                    onAmenityChange={handleAmenityChange}
                    placeholder="Select amenities available in this area..."
                    disabled={isSubmitting}
                  />
                  {getFieldError('amenity_ids') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('amenity_ids')}</p>
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
                  Area Images
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaModal(true)}
                  className="flex items-center space-x-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Select Images</span>
                </Button>
              </div>

              {/* Selected Images Preview */}
              {selectedMediaData && selectedMediaData.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Images ({selectedMediaData.length}):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMediaData.map((media) => (
                      <div key={media.id} className="relative group">
                        <img
                          src={media.url}
                          alt={media.title || `Media ${media.id}`}
                          className="w-full h-24 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(media.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedMediaData || selectedMediaData.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No images selected</p>
                  <p className="text-xs text-gray-400">Click "Select Images" to choose media</p>
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
        selectionMode="multiple"
        allowAddNew={true}
        title="Select Area Images"
      />
    </div>
  );
};

export default AreaEditPage;
