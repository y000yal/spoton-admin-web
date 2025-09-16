import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, X, Eye, EyeOff, Settings } from 'lucide-react';
import type { PaginatedResponse } from '../../types';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  searchable?: boolean;
  visible?: boolean; // New property for column visibility
  hideFromVisibility?: boolean; // Hide from column visibility dropdown
  hideFromSearch?: boolean; // Hide from search field dropdown
}

interface DataTableProps<T> {
  data: PaginatedResponse<T> | T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onSearch?: (filterField: string, filterValue: string) => void;
  onClearSearch?: () => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  className?: string;
  // Search state props
  searchField?: string;
  searchValue?: string;
  // Pagination state props
  currentPage?: number;
  pageSize?: number;
}

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onSort,
  onSearch,
  onClearSearch,
  onRefresh,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showPagination = true,
  className = '',
  searchField = '',
  searchValue = '',
}: DataTableProps<T>) {
  const isPaginated = 'current_page' in data;
  const paginatedData = isPaginated ? data : null;
  const tableData = isPaginated ? data.data : data;

  // Get searchable columns (default to all if not specified, but exclude hidden ones)
  const searchableColumns = columns.filter(col => 
    col.searchable !== false && !col.hideFromSearch
  );
  
  // Ensure there's at least one searchable column
  const finalSearchableColumns = searchableColumns.length > 0 ? searchableColumns : columns.filter(col => col.searchable !== false);

  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localSearchField, setLocalSearchField] = useState(() => {
    if (searchField) return searchField;
    return finalSearchableColumns[0]?.key ? String(finalSearchableColumns[0].key) : '';
  });
  const [localSearchValue, setLocalSearchValue] = useState(searchValue ?? '');
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => col.visible !== false).map(col => String(col.key)))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Sync local state with parent state only when parent explicitly changes
  useEffect(() => {
    if (searchField && searchField !== localSearchField) {
      setLocalSearchField(searchField);
    }
    // Only sync searchValue if it's explicitly set by parent (like from refresh)
    if (searchValue !== undefined && searchValue === '') {
      setLocalSearchValue('');
    }
  }, [searchField, searchValue]);

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnMenu) {
        const target = event.target as Element;
        if (!target.closest('.column-menu-container')) {
          setShowColumnMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  const handleSort = (field: string) => {
    if (!onSort) return;
    
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  const handleSearch = () => {
    if (onSearch && localSearchValue.trim()) {
      onSearch(localSearchField, localSearchValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && localSearchValue.trim()) {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchValue('');
    setLocalSearchField(finalSearchableColumns[0]?.key ? String(finalSearchableColumns[0].key) : '');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const handleRefresh = () => {
    setLocalSearchValue('');
    setLocalSearchField(finalSearchableColumns[0]?.key ? String(finalSearchableColumns[0].key) : '');
    if (onRefresh) {
      onRefresh();
    } else if (onClearSearch) {
      onClearSearch();
    }
  };

  // Column visibility functions
  const toggleColumnVisibility = (columnKey: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnKey)) {
      newVisibleColumns.delete(columnKey);
    } else {
      newVisibleColumns.add(columnKey);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const toggleAllColumns = () => {
    const visibleColumnsList = columns.filter(col => !col.hideFromVisibility);
    const visibleKeys = visibleColumnsList.map(col => String(col.key));
    const visibleKeysSet = new Set(visibleKeys);
    
    if (visibleColumns.size === visibleKeysSet.size) {
      // Hide all visible columns
      setVisibleColumns(new Set());
    } else {
      // Show all visible columns
      setVisibleColumns(visibleKeysSet);
    }
  };

  // Filter columns based on visibility
  const filteredColumns = columns.filter(col => visibleColumns.has(String(col.key)));

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item);
    }
    
    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      return new Date(value).toLocaleDateString();
    }
    
    return String(value);
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortField === column.key) {
      return sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      );
    }
    
    return <ChevronUp className="h-4 w-4 text-gray-300" />;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Search and Filters */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Field Selector */}
            <select
              value={localSearchField}
              onChange={(e) => setLocalSearchField(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 focus:shadow-md"
            >
              {finalSearchableColumns.map((column) => (
                <option key={String(column.key)} value={String(column.key)}>
                  {column.header}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 max-w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={searchPlaceholder}
                className={`block w-full pl-10 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 focus:shadow-md ${
                  localSearchValue.trim() ? 'pr-24' : 'pr-12'
                }`}
              />
                             {/* Search Button - Only show when there's text */}
              {localSearchValue.trim() && (
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-8 pr-3 flex items-center text-primary-600 hover:text-primary-700 hover:text-primary-800 text-sm font-medium cursor-pointer transition-colors"
                >
                  Search
                </button>
              )}
              {/* X Button - Clear input */}
              {localSearchValue && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Column Visibility Button */}
            <div className="relative column-menu-container">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md"
                title="Show/Hide columns"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {/* Column Visibility Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Show/Hide Columns</h3>
                      <button
                        onClick={toggleAllColumns}
                        className="text-xs text-primary-600 hover:text-primary-800"
                      >
                        {visibleColumns.size === columns.filter(col => !col.hideFromVisibility).length ? 'Hide All' : 'Show All'}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {columns
                        .filter(column => !column.hideFromVisibility)
                        .map((column) => (
                        <label key={String(column.key)} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(String(column.key))}
                            onChange={() => toggleColumnVisibility(String(column.key))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{column.header}</span>
                          {visibleColumns.has(String(column.key)) ? (
                            <Eye className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {filteredColumns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={filteredColumns.length} className="px-6 py-12 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              tableData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {filteredColumns.map((column) => (
                    <td 
                      key={String(column.key)} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.key === 'actions' ? 'text-left' : 'text-left'
                      }`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && paginatedData && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Showing {paginatedData.from} to {paginatedData.to} of {paginatedData.total} results
              </div>
              
              {/* Page Size Dropdown */}
              {onPageSizeChange && (
                <div className="flex items-center space-x-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-700">
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={paginatedData.per_page || 10}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 focus:shadow-md"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange?.(paginatedData.current_page - 1)}
                disabled={!paginatedData.prev_page_url}
                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {paginatedData.current_page} of {paginatedData.last_page}
              </span>
              
              <button
                onClick={() => onPageChange?.(paginatedData.current_page + 1)}
                disabled={!paginatedData.next_page_url}
                className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
