import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSport, updateSport } from '../../store/slices/sportSlice';
import { Button, Card } from '../../components/UI';
import { ArrowLeft, Trophy, Upload, X } from 'lucide-react';
import type { UpdateSportRequest } from '../../types';

const SportEditPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sportId } = useParams<{ sportId: string }>();
  
  const { currentSport, isLoading } = useAppSelector((state) => state.sports);
  
  const [formData, setFormData] = useState<UpdateSportRequest>({
    name: '',
    description: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Refs to track API calls and prevent duplicates
  const fetchedSportIdRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);

  // Fetch sport data when component mounts - only once per sportId
  useEffect(() => {
    if (sportId) {
      const sportIdNum = parseInt(sportId);
      if (fetchedSportIdRef.current !== sportIdNum) {
        fetchedSportIdRef.current = sportIdNum;
        dispatch(fetchSport(sportIdNum));
      }
    }
  }, [dispatch, sportId]);

  // Update form data when sport is loaded
  useEffect(() => {
    if (currentSport) {
      setFormData({
        name: currentSport.name || '',
        description: currentSport.description || '',
        status: currentSport.status || 'active'
      });
      
      // Set existing image if available
      if (currentSport.media_url) {
        setImagePreview(currentSport.media_url);
        setHasExistingImage(true);
      }
    }
  }, [currentSport]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          sport_image: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          sport_image: 'Image size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        sport_image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Mark that we have a new image (not existing)
      setHasExistingImage(false);

      // Clear error
      if (errors.sport_image) {
        setErrors(prev => ({
          ...prev,
          sport_image: ''
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setHasExistingImage(false);
    setFormData(prev => ({
      ...prev,
      sport_image: undefined
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !sportId) {
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      await dispatch(updateSport({ 
        sportId: parseInt(sportId), 
        sportData: formData,
        existingMediaId: currentSport?.media_id
      })).unwrap();
      navigate('/sports');
    } catch (error) {
      console.error('Failed to update sport:', error);
      setErrors({ submit: 'Failed to update sport. Please try again.' });
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigate('/sports');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentSport) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sport not found</h3>
        <p className="mt-1 text-sm text-gray-500">The sport you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/sports')}>
            Back to Sports
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
          onClick={() => navigate('/sports')}
          className="flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Trophy className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Edit Sport</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
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
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter sport name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sport description"
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
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
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
                        <Trophy className="h-4 w-4" />
                        <span>Update Sport</span>
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
                Sport Image
              </label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="sport_image"
                    name="sport_image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="sport_image"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload an image
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Sport preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {formData.name || 'Sport'} Image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click the X to remove
                    </p>
                  </div>
                </div>
              )}
              
              {errors.sport_image && (
                <p className="mt-2 text-sm text-red-600">{errors.sport_image}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SportEditPage;
