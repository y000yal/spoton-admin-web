import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useAmenities } from '../hooks/useAmenities';
import { getAmenityIcon } from '../utils/amenityIcons.tsx';
import type { Amenity } from '../services/api/amenities';

interface AmenityMultiSelectProps {
  selectedAmenityIds: number[];
  onAmenityChange: (amenityIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const AmenityMultiSelect: React.FC<AmenityMultiSelectProps> = ({
  selectedAmenityIds,
  onAmenityChange,
  placeholder = "Select amenities...",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);

  const { data: amenitiesData, isLoading, error } = useAmenities({ limit: 1000 });

  // Filter amenities based on search term
  const filteredAmenities = amenitiesData?.data?.filter((amenity: Amenity) =>
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amenity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amenity.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group amenities by category
  const groupedAmenities = filteredAmenities.reduce((acc: Record<string, Amenity[]>, amenity: Amenity) => {
    const category = amenity.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  // Update selected amenities when selectedAmenityIds changes
  useEffect(() => {
    if (amenitiesData?.data && selectedAmenityIds.length > 0) {
      const amenities = amenitiesData.data.filter((amenity: Amenity) => 
        selectedAmenityIds.includes(amenity.id)
      );
      setSelectedAmenities(amenities);
    } else if (selectedAmenityIds.length > 0 && !amenitiesData?.data) {
      // If we have selected IDs but amenities data isn't loaded yet, 
      // create placeholder amenities to show the IDs
      const placeholderAmenities = selectedAmenityIds.map(id => ({
        id,
        name: `Amenity ${id}`,
        slug: `amenity-${id}`,
        description: 'Loading...',
        icon: null,
        category: 'Other',
        is_active: true,
        sort_order: 0,
        created_at: '',
        updated_at: ''
      }));
      setSelectedAmenities(placeholderAmenities);
    } else {
      setSelectedAmenities([]);
    }
  }, [selectedAmenityIds, amenitiesData]);

  const handleAmenityToggle = (amenity: Amenity) => {
    const isSelected = selectedAmenityIds.includes(amenity.id);
    let newSelectedIds: number[];

    if (isSelected) {
      newSelectedIds = selectedAmenityIds.filter(id => id !== amenity.id);
    } else {
      newSelectedIds = [...selectedAmenityIds, amenity.id];
    }

    onAmenityChange(newSelectedIds);
  };

  const handleRemoveAmenity = (amenityId: number) => {
    const newSelectedIds = selectedAmenityIds.filter(id => id !== amenityId);
    onAmenityChange(newSelectedIds);
  };

  const handleClearAll = () => {
    onAmenityChange([]);
  };


  return (
    <div className={`relative ${className}`}>
      {/* Selected Amenities Display */}
      <div className="min-h-[42px] border border-gray-300 rounded-md p-2 bg-white">
        {selectedAmenities.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedAmenities.map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {getAmenityIcon(amenity.icon)}
                <span>{amenity.name}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity.id)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {!disabled && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        )}
      </div>

      {/* Dropdown Button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Amenities List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading amenities...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p className="text-sm">Failed to load amenities</p>
              </div>
            ) : filteredAmenities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No amenities found</p>
              </div>
            ) : (
              <div className="py-2">
                {(Object.entries(groupedAmenities) as [string, Amenity[]][]).map(([category, amenities]) => (
                  <div key={category}>
                    <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      {category}
                    </div>
                    {amenities.map((amenity: Amenity) => {
                      const isSelected = selectedAmenityIds.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getAmenityIcon(amenity.icon)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {amenity.name}
                              </div>
                              {amenity.description && (
                                <div className="text-xs text-gray-500">
                                  {amenity.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AmenityMultiSelect;
