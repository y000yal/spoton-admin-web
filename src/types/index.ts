// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

// User Types
export interface User {
  id: number;
  full_name: string | null;
  username: string | null;
  email: string | null;
  email_verified_at: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  role?: Role;
}

export interface CreateUserRequest {
  role_id: number;
  email: string;
  full_name: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  username: string;
  password: string;
  confirm_password: string;
  address: string;
  mobile_no: number;
}

export interface UpdateUserRequest {
  role_id?: number;
  full_name?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  email?: string;
  username?: string;
  status?: number;
}

// Role Types
export interface Role {
  id: number;
  name: string;
  display_name: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  display_name?: string;
  description?: string;
  status: string;
}

export interface UpdateRoleRequest {
  name?: string;
  display_name?: string;
  description?: string;
  status: string;
}

// Permission Types
export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  display_name: string;
  description: string;
  status: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  display_name?: string;
  description?: string;
  status: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

// Filter and Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface UserFilters extends PaginationParams {
  search?: string;
  status?: string;
  role_id?: number;
}
