import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, MediaSelectionModal } from '../../components/UI';
import { ArrowLeft, Building2, Image as ImageIcon } from 'lucide-react';
import type { CreateCenterRequest, User as UserType, Country } from '../../types';
import { useCreateCenter } from '../../hooks/useCenters';
import { useQueryClient } from '@tanstack/react-query';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from '../../hooks/useAuth';
import UserSearchInput from '../../components/UserSearchInput';
import CountrySearchInput from '../../components/CountrySearchInput';

const CenterCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreateCenterRequest>({
    name: '',
    country_id: 0,
    description: '',
    address: '',
    longitude: 0,
    latitude: 0,
    status: 'active',
    media_ids: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
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

  // Auth and permissions
  const { user } = useAuth();
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  // React Query hooks
  const createCenterMutation = useCreateCenter();
  const queryClient = useQueryClient();

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
  };

  const handleUserSelect = (selectedUser: UserType | null) => {
    setSelectedUser(selectedUser);
    setFormData(prev => ({
      ...prev,
      user_id: selectedUser?.id || user?.id
    }));
  };

  const handleCountrySelect = (selectedCountry: Country | null) => {
    setSelectedCountry(selectedCountry);
    setFormData(prev => ({
      ...prev,
      country_id: selectedCountry?.id || 0
    }));
  };

  const validateForm = (): boolean => {
    return formData.name.trim().length > 0 && 
           formData.country_id > 0 && 
           formData.address.trim().length > 0 &&
           formData.status.length > 0;
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
      const submitData = {
        ...formData,
        user_id: isAdmin ? (selectedUser?.id || user?.id) : user?.id
      };
      await createCenterMutation.mutateAsync(submitData);
      
      // Invalidate and refetch the centers list data
      await queryClient.invalidateQueries({ queryKey: ["centers"] });
      await queryClient.refetchQueries({ queryKey: ["centers"] });
      
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


  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold text-gray-900">Create Center</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit}>
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
                      value={formData.name}
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
                    value={formData.address}
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
                      value={formData.longitude}
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
                      value={formData.latitude}
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
                    value={formData.description}
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

                <div className="flex justify-end space-x-3">
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
                        <Building2 className="h-4 w-4" />
                        <span>Create Center</span>
                      </>
                    )}
                  </Button>
                </div>
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
                    {selectedMediaIds.map((mediaId) => (
                      <div key={mediaId} className="relative group">
                        <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
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
                    ))}
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
        title="Select Center Images"
      />
    </div>
  );
};

export default CenterCreatePage;
