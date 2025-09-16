export interface QueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  [key: string]: unknown; // Allow additional filter parameters
}

/**
 * Builds query parameters supporting both filtering formats:
 * 1. filter_field + filter_value (legacy format)
 * 2. filter[field_name] = value (Laravel-style format)
 */
export function buildQueryParams(params: QueryParams): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {};
  
  // Add basic pagination and sorting parameters
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.sort_field !== undefined) queryParams.sort_field = params.sort_field;
  if (params.sort_by !== undefined) queryParams.sort_by = params.sort_by;
  
  // Handle filtering - only Laravel-style format for now
  if (params.filter_field && params.filter_value) {
    // Only add Laravel-style format: filter[field_name] = value
    queryParams[`filter[${params.filter_field}]`] = params.filter_value;
  }
  
  // Add any additional custom filter parameters
  Object.keys(params).forEach(key => {
    if (!['limit', 'page', 'filter_field', 'filter_value', 'sort_field', 'sort_by'].includes(key)) {
      queryParams[key] = params[key];
    }
  });
  
  return queryParams;
}

/**
 * Builds filter parameters for a specific field using Laravel-style format
 */
export function buildFilterParams(field: string, value: string): Record<string, unknown> {
  if (!value.trim()) {
    return {};
  }
  
  return {
    [`filter[${field}]`]: value.trim()
  };
}
