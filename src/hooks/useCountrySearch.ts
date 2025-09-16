import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { countryService } from '../services/api/countries';
import type { Country } from '../types';

export const useCountrySearch = (searchQuery: string, enabled: boolean = true) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['countries', 'search', debouncedQuery],
    queryFn: () => countryService.getCountries({
      limit: 10,
      page: 1,
      filter_field: 'name',
      filter_value: debouncedQuery
    }),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    countries: data?.data || [],
    isLoading,
    error,
    hasResults: (data?.data || []).length > 0
  };
};
