import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, MapPin, Upload, X } from 'lucide-react';
import type { UpdateAreaRequest } from '../../types';
import { useArea, useUpdateArea } from '../../hooks/useAreas';
import { useCenter } from '../../hooks/useCenters';
import { useFormValidation } from '../../hooks/useFormValidation';

const AreaEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { centerId, areaId } = useParams<{ centerId: string; areaId: string }>();
  
  const [formData, setFormData] = useState<UpdateAreaRequest>({
    name: '',
    status: 'active',
    description: '',
    floor: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingMediaIds, setExistingMediaIds] = useState<number[]>([]);

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

  // Update form data when area is loaded
  useEffect(() => {
    if (currentArea) {
      setFormData({
        name: currentArea.name || '',
        status: currentArea.status || 'active',
        description: currentArea.description || '',
        floor: currentArea.floor || ''
      });
      
      // Set existing media
      if (currentArea.media && currentArea.media.length > 0) {
        setImagePreviews(currentArea.media.map(media => media.url));
        setExistingMediaIds(currentArea.media.map(media => media.id));
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setClientErrors({ images: 'Please select valid image files only' });
        return;
      }

      // Validate file sizes (5MB limit per file)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setClientErrors({ images: 'Image size must be less than 5MB per file' });
        return;
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));

      // Create previews
      const newPreviews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Clear any existing validation error
      clearFieldError('images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If removing an existing image, remove from media_ids
    if (index < existingMediaIds.length) {
      const newMediaIds = existingMediaIds.filter((_, i) => i !== index);
      setExistingMediaIds(newMediaIds);
      setFormData(prev => ({
        ...prev,
        media_ids: newMediaIds
      }));
    } else {
      // If removing a new image, remove from images array
      const newImageIndex = index - existingMediaIds.length;
      setFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== newImageIndex) || []
      }));
    }
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
          media_ids: existingMediaIds
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
            </form>
          </Card>
        </div>

        {/* Image Upload Section */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Area Images
              </label>
              
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                hasFieldError('images') 
                  ? 'border-red-500 hover:border-red-600' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload more images
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </span>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Current Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {getFieldError('images') && (
                <p className="mt-2 text-sm text-red-600">{getFieldError('images')}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AreaEditPage;
