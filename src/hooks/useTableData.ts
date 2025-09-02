import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';

export interface TableDataConfig {
  fetchAction: (params: any) => any;
  searchAction?: (params: any) => any;
  initialPageSize?: number;
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  searchFields?: string[];
  defaultSearchField?: string;
}

export interface TableDataState {
  // Search state
  searchField: string;
  searchValue: string;
  
  // Pagination state
  currentPage: number;
  currentPageSize: number;
  
  // Sort state
  sortField: string;
  sortDirection: 'asc' | 'desc';
  
  // Loading state
  isLoading: boolean;
  hasInitialFetch: boolean;
}

export interface TableDataActions {
  // Search actions
  handleSearch: (field: string, value: string) => void;
  handleClearSearch: () => void;
  
  // Pagination actions
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  
  // Sort actions
  handleSort: (field: string, direction: 'asc' | 'desc') => void;
  
  // Refresh action
  handleRefresh: () => void;
}

export function useTableData(config: TableDataConfig): [TableDataState, TableDataActions] {
  const {
    fetchAction,
    searchAction,
    initialPageSize = 10,
    defaultSortField = 'created_at',
    defaultSortDirection = 'desc',
    searchFields: _searchFields = [],
    defaultSearchField = ''
  } = config;

  const dispatch = useAppDispatch();
  const hasInitialFetch = useRef(false);

  // State
  const [searchField, setSearchField] = useState(defaultSearchField);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [isLoading, setIsLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;
    
    if (!hasInitialFetch.current && isMounted) {
      hasInitialFetch.current = true;
      setIsLoading(true);
      
      const params = {
        page: 1,
        limit: currentPageSize,
        sort_field: sortField,
        sort_by: sortDirection
      };
      
      console.log('🔄 useTableData: Initial fetch with params:', params);
      
      dispatch(fetchAction(params))
        .then((result) => {
          console.log('🔄 useTableData: Fetch result:', result);
        })
        .catch((error) => {
          console.error('🔄 useTableData: Fetch error:', error);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, currentPageSize, sortField, sortDirection]);

  // Search handler
  const handleSearch = (field: string, value: string) => {
    setSearchField(field);
    setSearchValue(value);
    setCurrentPage(1);
    setIsLoading(true);
    
    const params: any = {
      page: 1,
      limit: currentPageSize,
      sort_field: sortField,
      sort_by: sortDirection
    };
    
    if (value.trim()) {
      params[`filter[${field}]`] = value.trim();
    }
    
    if (searchAction && value.trim()) {
      dispatch(searchAction(params))
        .finally(() => setIsLoading(false));
    } else {
      dispatch(fetchAction(params))
        .finally(() => setIsLoading(false));
    }
  };

  // Clear search handler
  const handleClearSearch = () => {
    setSearchField(defaultSearchField);
    setSearchValue('');
    setCurrentPage(1);
    setSortField(defaultSortField);
    setSortDirection(defaultSortDirection);
    setIsLoading(true);
    
    const params = {
      page: 1,
      limit: currentPageSize,
      sort_field: defaultSortField,
      sort_by: defaultSortDirection,
      forceRefresh: true
    };
    
    dispatch(fetchAction(params))
      .finally(() => setIsLoading(false));
  };

  // Page change handler
  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setIsLoading(true);
    
    const params: any = {
      page,
      limit: currentPageSize,
      sort_field: sortField,
      sort_by: sortDirection
    };
    
    if (searchValue.trim()) {
      params[`filter[${searchField}]`] = searchValue.trim();
    }
    
    if (searchAction && searchValue.trim()) {
      dispatch(searchAction(params))
        .finally(() => setIsLoading(false));
    } else {
      dispatch(fetchAction(params))
        .finally(() => setIsLoading(false));
    }
  };

  // Page size change handler
  const onPageSizeChange = (pageSize: number) => {
    setCurrentPageSize(pageSize);
    setCurrentPage(1);
    setIsLoading(true);
    
    const params: any = {
      page: 1,
      limit: pageSize,
      sort_field: sortField,
      sort_by: sortDirection
    };
    
    if (searchValue.trim()) {
      params[`filter[${searchField}]`] = searchValue.trim();
    }
    
    if (searchAction && searchValue.trim()) {
      dispatch(searchAction(params))
        .finally(() => setIsLoading(false));
    } else {
      dispatch(fetchAction(params))
        .finally(() => setIsLoading(false));
    }
  };

  // Sort handler
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const validDirection = direction === 'asc' || direction === 'desc' ? direction : 'asc';
    
    setSortField(field);
    setSortDirection(validDirection);
    setCurrentPage(1);
    setIsLoading(true);
    
    const params: any = {
      page: 1,
      limit: currentPageSize,
      sort_field: field,
      sort_by: validDirection
    };
    
    if (searchValue.trim()) {
      params[`filter[${searchField}]`] = searchValue.trim();
    }
    
    if (searchAction && searchValue.trim()) {
      dispatch(searchAction(params))
        .finally(() => setIsLoading(false));
    } else {
      dispatch(fetchAction(params))
        .finally(() => setIsLoading(false));
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsLoading(true);
    
    const params: any = {
      page: currentPage,
      limit: currentPageSize,
      sort_field: sortField,
      sort_by: sortDirection,
      forceRefresh: true
    };
    
    if (searchValue.trim()) {
      params[`filter[${searchField}]`] = searchValue.trim();
    }
    
    if (searchAction && searchValue.trim()) {
      dispatch(searchAction(params))
        .finally(() => setIsLoading(false));
    } else {
      dispatch(fetchAction(params))
        .finally(() => setIsLoading(false));
    }
  };

  const state: TableDataState = {
    searchField,
    searchValue,
    currentPage,
    currentPageSize,
    sortField,
    sortDirection,
    isLoading,
    hasInitialFetch: hasInitialFetch.current
  };

  const actions: TableDataActions = {
    handleSearch,
    handleClearSearch,
    onPageChange,
    onPageSizeChange,
    handleSort,
    handleRefresh
  };

  return [state, actions];
}
