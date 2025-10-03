import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, MediaSelectionModal, SportSearchInput } from '../../components/UI';
import { ArrowLeft, MapPin, Image as ImageIcon } from 'lucide-react';
import type { CreateAreaRequest, Sport } from '../../types';
import { useCreateArea } from '../../hooks/useAreas';
import { useCenter, useCenters } from '../../hooks/useCenters';
import { useQueryClient } from '@tanstack/react-query';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useDynamicPermissions } from '../../hooks/useDynamicPermissions';
import { useMedia } from '../../hooks/useMedia';
import AmenityMultiSelect from '../../components/AmenityMultiSelect';

const AreaCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
  const isCenterSpecific = !!centerId;
  const { hasPermission } = useDynamicPermissions();
  
  const [formData, setFormData] = useState<CreateAreaRequest>({
    name: '',
    status: 'active',
    description: '',
    floor: '',
    sport_id: undefined,
    media_ids: [],
    amenity_ids: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  
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
    clearFieldError,
    handleApiError,
    getFieldError,
    hasFieldError,
  } = useFormValidation();

  // Ref to prevent duplicate form submissions
  const isSubmittingRef = useRef(false);

  // React Query hooks
  const { data: center } = useCenter(parseInt(centerId || '0'));
  const { data: centersData } = useCenters({ limit: 1000 }); // Get all centers for selection
  const createAreaMutation = useCreateArea();
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
  };

  const handleAmenityChange = (amenityIds: number[]) => {
    setSelectedAmenityIds(amenityIds);
    setFormData(prev => ({
      ...prev,
      amenity_ids: amenityIds
    }));
  };



  const validateForm = (): boolean => {
    return formData.name.trim().length > 0 && 
           formData.floor.trim().length > 0 &&
           formData.status.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !centerId) {
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      const targetCenterId = isCenterSpecific ? parseInt(centerId!) : selectedCenterId;
      if (!targetCenterId) {
        throw new Error('Center ID is required');
      }

      await createAreaMutation.mutateAsync({ 
        centerId: targetCenterId, 
        areaData: formData 
      });
      
      // Invalidate and refetch the areas list data
      await queryClient.invalidateQueries({ queryKey: ["areas"] });
      await queryClient.refetchQueries({ queryKey: ["areas"] });
      
      if (isCenterSpecific) {
        navigate(`/centers/${centerId}/areas`);
      } else {
        navigate('/areas');
      }
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

  // Check if user has permission to create areas
  if (!hasPermission('area-store')) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have permission to create areas.</p>
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
            onClick={() => navigate(isCenterSpecific ? `/centers/${centerId}/areas` : '/areas')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCenterSpecific ? 'Create Area' : 'Create New Area'}
            </h1>
            {isCenterSpecific && center && (
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Create Area</span>
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
                {/* Center Selection for General Areas */}
                {!isCenterSpecific && (
                  <div>
                    <label htmlFor="center_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Center <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="center_id"
                      value={selectedCenterId || ''}
                      onChange={(e) => setSelectedCenterId(parseInt(e.target.value) || null)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !selectedCenterId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a center</option>
                      {centersData?.data?.map((center) => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                    {!selectedCenterId && (
                      <p className="mt-1 text-sm text-red-600">Please select a center</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={formData.floor}
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
                    value={formData.description}
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
                  size="sm"
                  onClick={() => setShowMediaModal(true)}
                  className="flex items-center space-x-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Select Images</span>
                </Button>
              </div>
              
              {selectedMediaIds.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {selectedMediaIds.length} image(s) selected
                  </div>
                  
                  {/* Selected Images Preview */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMediaIds.map((mediaId) => {
                      const media = selectedMediaData?.data?.find(m => m.id === mediaId);
                      return (
                        <div key={mediaId} className="relative group">
                          <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                            {media ? (
                              <img 
                                src={media.url} 
                                alt={`Media ${mediaId}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newSelectedIds = selectedMediaIds.filter(id => id !== mediaId);
                              setSelectedMediaIds(newSelectedIds);
                              setFormData(prev => ({
                                ...prev,
                                media_ids: newSelectedIds
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
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

export default AreaCreatePage;
