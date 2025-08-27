import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Button from './Button';

interface SearchBarProps {
  onSearch: (filterField: string, filterValue: string) => void;
  onClear: () => void;
  filterField: string;
  filterValue: string;
  columns: Array<{
    key: string;
    header: string;
    searchable?: boolean;
  }>;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  filterField,
  filterValue,
  columns,
  placeholder = "Search...",
  className = ""
}) => {
  const [searchValue, setSearchValue] = useState(filterValue);
  const [selectedField, setSelectedField] = useState(filterField);

  // Get searchable columns (default to all if not specified)
  const searchableColumns = columns.filter(col => col.searchable !== false);

  useEffect(() => {
    setSearchValue(filterValue);
    setSelectedField(filterField);
  }, [filterField, filterValue]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(selectedField, searchValue.trim());
    }
  };

  const handleClear = () => {
    setSearchValue('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Field Selector */}
      <select
        value={selectedField}
        onChange={(e) => setSelectedField(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {searchableColumns.map((column) => (
          <option key={column.key} value={column.key}>
            {column.header}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="sm"
        className="px-4 py-2"
      >
        Search
      </Button>

      {/* Clear Button */}
      {(filterValue || searchValue) && (
        <Button
          variant="secondary"
          onClick={handleClear}
          size="sm"
          className="px-4 py-2"
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
