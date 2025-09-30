import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, MediaSelectionModal } from '../../components/UI';
import { ArrowLeft, Building2, X, Image as ImageIcon, Mail, Phone } from 'lucide-react';
import type { UpdateCenterRequest, User as UserType, Country } from '../../types';
import { useCenter, useUpdateCenter } from '../../hooks/useCenters';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useMedia } from '../../hooks/useMedia';
import { useAuth } from '../../hooks/useAuth';
import UserSearchInput from '../../components/UserSearchInput';
import CountrySearchInput from '../../components/CountrySearchInput';
import OperatingHours from '../../components/OperatingHours';

const CenterEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId } = useParams<{ centerId: string }>();
  
  const [formData, setFormData] = useState<UpdateCenterRequest>({
    name: '',
    country_id: 0,
    description: '',
    address: '',
    longitude: 0,
    latitude: 0,
    status: 'active',
    center_email: '',
    contact_number: '',
    operating_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    banner_image_id: null,
    media_ids: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [bannerImageId, setBannerImageId] = useState<number | null>(null);

  // Use the form validation hook
  const {
    errors,
    clearFieldError,
    handleApiError,
    getFieldError,
    hasFieldError,
    setClientErrors,
    clearAllErrors,
  } = useFormValidation();

  // Refs to track API calls and prevent duplicates
  const isSubmittingRef = useRef(false);

  // Auth and permissions
  const { user } = useAuth();
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  // React Query hooks
  const { data: currentCenter, isLoading } = useCenter(parseInt(centerId || '0'));
  const updateCenterMutation = useUpdateCenter();
  
  // Fetch all media and filter by selected IDs
  const { data: allMediaData } = useMedia({
    page: 1,
    limit: 1000 // Get a large number to ensure we have all media
  });
  
  // Filter media by selected IDs
  const selectedMediaData = allMediaData?.data?.filter(media => 
    selectedMediaIds.includes(media.id)
  ) || [];

  // Update form data when center is loaded
  useEffect(() => {
    if (currentCenter) {
      setFormData({
        name: currentCenter.name || '',
        country_id: currentCenter.country_id || 0,
        description: currentCenter.description || '',
        address: currentCenter.address || '',
        longitude: currentCenter.longitude || 0,
        latitude: currentCenter.latitude || 0,
        status: currentCenter.status || 'active',
        center_email: currentCenter.center_details?.email || '',
        contact_number: currentCenter.center_details?.contact_number || '',
        operating_hours: currentCenter.center_details?.operating_hours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false }
        },
        banner_image_id: currentCenter.center_details?.banner_image?.id || null,
        user_id: currentCenter.user_id
      });
      
      // Set existing country if available
      if (currentCenter.country) {
        setSelectedCountry(currentCenter.country);
      }
      
      // Set existing user if available
      if (currentCenter.user) {
        // Convert the center's user object to match our User type
        const userData: UserType = {
          id: currentCenter.user.id,
          full_name: currentCenter.user.full_name,
          username: null,
          email: currentCenter.user.email,
          email_verified_at: null,
          status: currentCenter.user.status,
          created_at: '',
          updated_at: null,
          role_id: undefined,
          role: undefined
        };
        setSelectedUser(userData);
      }
      
      // Set existing media if available
      if (currentCenter.media && currentCenter.media.length > 0) {
        const mediaIds = currentCenter.media.map(media => media.media_id);
        setSelectedMediaIds(mediaIds);
        setFormData(prev => ({
          ...prev,
          media_ids: mediaIds
        }));
      }

      // Set existing banner image if available
      if (currentCenter.center_details?.banner_image?.id) {
        setBannerImageId(currentCenter.center_details.banner_image.id);
      }
    }
  }, [currentCenter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'country_id' || name === 'longitude' || name === 'latitude' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Clear error when user starts typing
    clearFieldError(name);
  };

  const handleMediaSelect = (mediaIds: number[]) => {
    setSelectedMediaIds(mediaIds);
    setFormData(prev => ({
      ...prev,
      media_ids: mediaIds
    }));
    console.log('Selected media IDs:', mediaIds);
  };

  const handleUserSelect = (selectedUser: UserType | null) => {
    setSelectedUser(selectedUser);
    setFormData(prev => ({
      ...prev,
      user_id: selectedUser?.id || user?.id
    }));
    
    // Clear user_id error when user is selected
    if (selectedUser) {
      clearFieldError('user_id');
    }
  };

  const handleCountrySelect = (selectedCountry: Country | null) => {
    setSelectedCountry(selectedCountry);
    setFormData(prev => ({
      ...prev,
      country_id: selectedCountry?.id || 0
    }));
  };

  const handleRemoveMedia = (mediaId: number) => {
    const newMediaIds = selectedMediaIds.filter(id => id !== mediaId);
    setSelectedMediaIds(newMediaIds);
    setFormData(prev => ({
      ...prev,
      media_ids: newMediaIds
    }));
    
    // If the removed media was the banner image, clear it
    if (bannerImageId === mediaId) {
      setBannerImageId(null);
      setFormData(prev => ({
        ...prev,
        banner_image_id: null
      }));
    }
  };

  const handleOperatingHoursChange = (operatingHours: UpdateCenterRequest['operating_hours']) => {
    setFormData(prev => ({
      ...prev,
      operating_hours: operatingHours
    }));
  };

  const handleBannerImageSelect = (imageId: number | null) => {
    setBannerImageId(imageId);
    setFormData(prev => ({
      ...prev,
      banner_image_id: imageId
    }));
  };

  const validateForm = (): boolean => {
    const isValid = (formData.name?.trim().length || 0) > 0 && 
           (formData.country_id || 0) > 0 && 
           (formData.address?.trim().length || 0) > 0 &&
           (formData.status?.length || 0) > 0;
    
    // Set client-side validation errors
    const clientErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      clientErrors.name = 'Center name is required';
    }
    
    if (!formData.country_id || formData.country_id === 0) {
      clientErrors.country_id = 'Please select a country';
    }
    
    if (!formData.address || formData.address.trim().length === 0) {
      clientErrors.address = 'Address is required';
    }
    
    if (!formData.status || formData.status.length === 0) {
      clientErrors.status = 'Status is required';
    }
    
    // Set client errors using the validation hook
    if (Object.keys(clientErrors).length > 0) {
      setClientErrors(clientErrors);
    } else {
      clearAllErrors();
    }
    
    return isValid;
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
      const submitData = {
        ...formData,
        media_ids: selectedMediaIds,
        user_id: isAdmin ? (selectedUser?.id || user?.id) : user?.id
      };

      await updateCenterMutation.mutateAsync({ 
        centerId: parseInt(centerId), 
        centerData: submitData
      });
      navigate('/centers');
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigate('/centers');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentCenter) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Center not found</h3>
        <p className="mt-1 text-sm text-gray-500">The center you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/centers')}>
            Back to Centers
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
            onClick={() => navigate('/centers')}
            className="flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Center</h1>
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
            form="center-form"
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
                <Building2 className="h-4 w-4" />
                <span>Update Center</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <form id="center-form" onSubmit={handleSubmit}>
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
                      placeholder="Enter center name"
                    />
                    {getFieldError('name') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <CountrySearchInput
                      selectedCountry={selectedCountry}
                      onCountrySelect={handleCountrySelect}
                      placeholder="Search countries..."
                    />
                    {getFieldError('country_id') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('country_id')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError('address') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter center address"
                  />
                  {getFieldError('address') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('address')}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude || 0}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('longitude') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter longitude"
                    />
                    {getFieldError('longitude') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('longitude')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude || 0}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('latitude') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter latitude"
                    />
                    {getFieldError('latitude') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('latitude')}</p>
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
                    placeholder="Enter center description"
                  />
                  {getFieldError('description') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="center_email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Center Email
                    </label>
                    <input
                      type="email"
                      id="center_email"
                      name="center_email"
                      value={formData.center_email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('center_email') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter center email"
                    />
                    {getFieldError('center_email') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('center_email')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value={formData.contact_number || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        hasFieldError('contact_number') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact number"
                    />
                    {getFieldError('contact_number') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('contact_number')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <OperatingHours
                    value={formData.operating_hours}
                    onChange={handleOperatingHoursChange}
                    error={getFieldError('operating_hours')}
                    disabled={isSubmitting}
                  />
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

                {/* User Selection - Only for Admins */}
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to User
                    </label>
                    <UserSearchInput
                      selectedUser={selectedUser}
                      onUserSelect={handleUserSelect}
                      placeholder="Search users to assign this center..."
                    />
                    {getFieldError('user_id') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('user_id')}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to assign to yourself
                    </p>
                  </div>
                )}

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
                  Center Images
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

              {/* Selected Images Preview with Banner Selection */}
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
                          className={`w-full h-24 object-cover rounded border-2 transition-colors ${
                            bannerImageId === media.id 
                              ? 'border-blue-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        
                        {/* Banner Selection Button */}
                        <button
                          type="button"
                          onClick={() => handleBannerImageSelect(bannerImageId === media.id ? null : media.id)}
                          className={`absolute top-1 left-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            bannerImageId === media.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {bannerImageId === media.id ? 'Banner' : 'Set Banner'}
                        </button>
                        
                        {/* Remove Image Button */}
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
                  
                  {bannerImageId && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        ✓ Banner image selected (ID: {bannerImageId})
                      </div>
                    </div>
                  )}
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
        title="Select Center Images"
      />
    </div>
  );
};

export default CenterEditPage;
