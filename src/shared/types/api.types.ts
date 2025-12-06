// Common API types

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// Pagination metadata from API
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// RTK Query wraps errors - this is the actual error shape from the server
export interface ApiErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}

// RTK Query FetchBaseQuery error wrapper
export interface ApiError {
  status: number;
  data?: ApiErrorResponse;
}

// Paginated response type - data is an array with meta for pagination
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// Nested paginated response (used by roles/permissions API)
// The API returns: { success, message, data: { data: T[], pagination: {...} } }
export interface NestedPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    pagination: PaginationMeta;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Supported languages
export type Language = 'en' | 'fr' | 'de' | 'it';

// Multilingual content
export type MultilingualContent = Record<Language, string>;

// Status types
export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type TranslationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

// Transaction types
export type TransactionType = 'rent' | 'buy';

// User types
export type UserType =
  | 'end_user'
  | 'owner'
  | 'agent'
  | 'agency_admin'
  | 'platform_admin'
  | 'super_admin';

/**
 * User types that have access to the admin panel
 * Only platform-level administrators are included here
 *
 * - super_admin: Full system access
 * - platform_admin: Platform-wide moderation and management
 *
 * NOTE: agency_admin is NOT included - they manage their agency, not the platform
 * This should match ADMIN_USER_TYPES in backend auth.types.ts
 */
export const ADMIN_USER_TYPES: readonly UserType[] = [
  'super_admin',
  'platform_admin',
] as const;

/**
 * Check if a user type is an admin type
 */
export const isAdminUserType = (userType: string): boolean => {
  return ADMIN_USER_TYPES.includes(userType as UserType);
};
