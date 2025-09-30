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
  full_name: string | null | {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  username: string | null;
  email: string | null;
  email_verified_at: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  role_id?: number;
  role?: Role;
  mobile_no?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  country_id?: number | null;
  address?: string | null;
  longitude?: string | null;
  latitude?: string | null;
  preferred_sports?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_no?: string | null;
  emergency_contact_relationship?: string | null;
  terms_and_condition_acceptance?: string | null;
  privacy_policy_acceptance?: string | null;
}

export interface CreateUserRequest {
  role_id: number;
  email: string;
  username: string;
  full_name: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  mobile_no?: string;
  date_of_birth?: string;
  gender?: string;
  country_id?: number;
  address?: string;
  longitude?: string;
  latitude?: string;
  preferred_sports?: string;
  emergency_contact_name?: string;
  emergency_contact_no?: string;
  emergency_contact_relationship?: string;
  terms_and_condition_acceptance?: string;
  privacy_policy_acceptance?: string;
  password: string;
  confirm_password: string;
}

export interface UpdateUserRequest {
  role_id?: number;
  email?: string;
  username?: string;
  full_name?: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  mobile_no?: string;
  date_of_birth?: string;
  gender?: string;
  country_id?: number;
  address?: string;
  longitude?: string;
  latitude?: string;
  preferred_sports?: string;
  emergency_contact_name?: string;
  emergency_contact_no?: string;
  emergency_contact_relationship?: string;
  terms_and_condition_acceptance?: string;
  privacy_policy_acceptance?: string;
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

// Sport Types
export interface Sport {
  id: number;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  media?: Array<{
    media_id: number;
    url: string;
  }>;
}

export interface CreateSportRequest {
  name: string;
  description?: string;
  status: string;
  media_ids?: number[];
}

export interface UpdateSportRequest {
  name?: string;
  description?: string;
  status?: string;
  media_ids?: number[];
}

// Media Types
export interface MediaUploadResponse {
  id?: number;
  media_id?: number;
  url?: string;
  title?: string;
  [key: string]: unknown;
}

// Center Types
export interface Center {
  id: number;
  name: string;
  country_id: number;
  country: {
    id: number;
    name: string;
  };
  description: string | null;
  address: string;
  longitude: number;
  latitude: number;
  status: string;
  user_id?: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
    status: string;
  };
  center_details?: {
    id: number;
    email: string;
    contact_number: string;
    operating_hours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    banner_image: {
      id: number;
      url: string;
    };
    created_at: string;
    updated_at: string;
  };
  media: Array<{
    media_id: number;
    url: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateCenterRequest {
  name: string;
  country_id: number;
  description?: string;
  address: string;
  longitude: number;
  latitude: number;
  status: string;
  center_email?: string;
  contact_number?: string;
  operating_hours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  banner_image_id?: number | null;
  media_ids?: number[];
  user_id?: number;
}

export interface UpdateCenterRequest {
  name?: string;
  country_id?: number;
  description?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  status?: string;
  center_email?: string;
  contact_number?: string;
  operating_hours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  banner_image_id?: number | null;
  media_ids?: number[];
  user_id?: number;
}

// Area Types
export interface Area {
  id: number;
  name: string;
  status: string;
  description: string | null;
  floor: string;
  center_id: number;
  sport_id?: number;
  sport?: Sport;
  amenity_ids?: number[];
  amenities?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    category: string | null;
  }>;
  media: Array<{
    id: number;
    title: string;
    url: string;
    type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateAreaRequest {
  name: string;
  status: string;
  description?: string;
  floor: string;
  sport_id?: number;
  media_ids?: number[];
  amenity_ids?: number[];
}

export interface UpdateAreaRequest {
  name?: string;
  status?: string;
  description?: string;
  floor?: string;
  sport_id?: number;
  media_ids?: number[];
  amenity_ids?: number[];
}

// Country Types
export interface Country {
  id: number;
  name: string;
}

// Media Types
export interface Media {
  id: number;
  title: string;
  url: string;
  type: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaRequest {
  images: File[];
  user_id: number;
  title?: string;
}

export interface UpdateMediaRequest {
  title?: string;
  user_id?: number;
}

export interface MediaQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}