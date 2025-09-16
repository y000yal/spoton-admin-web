import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchItem {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface GenericSearchInputProps<T extends SearchItem> {
  selectedItem: T | null;
  onItemSelect: (item: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchItems: T[];
  isLoading: boolean;
  hasResults: boolean;
  displayField?: string;
  subDisplayField?: string;
  icon?: React.ReactNode;
  minSearchLength?: number;
  onSearchChange?: (query: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

const GenericSearchInput = <T extends SearchItem>({
  selectedItem,
  onItemSelect,
  placeholder = "Search...",
  disabled = false,
  searchItems,
  isLoading,
  hasResults,
  displayField = 'name',
  subDisplayField,
  icon,
  minSearchLength = 3,
  onSearchChange,
  onOpenChange
}: GenericSearchInputProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
    
    if (value.length >= minSearchLength) {
      setIsOpen(true);
      setShowResults(true);
      onOpenChange?.(true);
    } else {
      setShowResults(false);
      onOpenChange?.(false);
    }
  };

  const handleItemSelect = (item: T) => {
    onItemSelect(item);
    setSearchQuery('');
    setIsOpen(false);
    setShowResults(false);
    onSearchChange?.('');
    onOpenChange?.(false);
  };

  const handleClear = () => {
    onItemSelect(null);
    setSearchQuery('');
    setIsOpen(false);
    setShowResults(false);
    onSearchChange?.('');
    onOpenChange?.(false);
  };

  const getDisplayValue = (item: T) => {
    if (typeof item[displayField] === 'string') {
      return item[displayField];
    }
    if (item[displayField] && typeof item[displayField] === 'object') {
      // Handle nested objects like full_name
      const obj = item[displayField] as Record<string, unknown>;
      if (obj.first_name || obj.last_name) {
        return [obj.first_name, obj.middle_name, obj.last_name].filter(Boolean).join(' ');
      }
      return String(obj);
    }
    return String(item[displayField] || item.name || 'Unknown');
  };

  const getSubDisplayValue = (item: T) => {
    if (!subDisplayField) return null;
    return String(item[subDisplayField] || '');
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon || <Search className="h-4 w-4 text-gray-400" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.length >= minSearchLength) {
              setIsOpen(true);
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {selectedItem && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Selected Item Display */}
      {selectedItem && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-medium text-blue-900">
              {getDisplayValue(selectedItem)}
            </span>
            {getSubDisplayValue(selectedItem) && (
              <span className="text-xs text-blue-600">
                ({getSubDisplayValue(selectedItem)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && showResults && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="ml-2 text-sm">Searching...</span>
            </div>
          ) : hasResults ? (
            <div className="py-1">
              {searchItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    {icon}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getDisplayValue(item)}
                      </div>
                      {getSubDisplayValue(item) && (
                        <div className="text-xs text-gray-500">
                          {getSubDisplayValue(item)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= minSearchLength ? (
            <div className="p-3 text-center text-gray-500">
              <span className="text-sm">No items found</span>
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              <span className="text-sm">Type at least {minSearchLength} characters to search</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericSearchInput;
