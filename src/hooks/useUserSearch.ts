import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/api/users';
import type { User } from '../types';

export const useUserSearch = (searchQuery: string, enabled: boolean = true) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => userService.getUsers({
      limit: 10,
      page: 1,
      filter_field: 'full_name',
      filter_value: debouncedQuery
    }),
    enabled: enabled && debouncedQuery.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    users: data?.data || [],
    isLoading,
    error,
    hasResults: (data?.data || []).length > 0
  };
};
