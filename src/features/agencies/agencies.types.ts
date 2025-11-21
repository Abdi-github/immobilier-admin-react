/**
 * Agencies Feature Types
 *
 * TypeScript type definitions for the Agencies admin feature.
 * Maps to the backend agency module API responses.
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export const AGENCY_STATUSES = ['active', 'pending', 'suspended', 'inactive'] as const;
export type AgencyStatus = (typeof AGENCY_STATUSES)[number];

// =============================================================================
// Core Types
// =============================================================================

export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

export interface AgencyCity {
  id: string;
  name: MultilingualText | string;
}

export interface AgencyCanton {
  id: string;
  name: MultilingualText | string;
  code: string;
}

/**
 * Agency entity as returned by the API
 */
export interface Agency {
  id: string;  // API returns 'id' not '_id'
  _id?: string; // For backwards compatibility
  name: string;
  slug: string;
  description?: MultilingualText | string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address: string;
  city_id: string;
  canton_id: string;
  postal_code?: string;
  status: AgencyStatus;
  is_verified: boolean;
  verification_date?: string;
  total_properties: number;
  created_at: string;
  updated_at: string;
  // Populated fields
  city?: AgencyCity;
  canton?: AgencyCanton;
}

// =============================================================================
// API Request Types
// =============================================================================

/**
 * Query parameters for listing agencies
 */
export interface AgencyQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  canton_id?: string;
  city_id?: string;
  status?: AgencyStatus;
  is_verified?: boolean;
  include_inactive?: boolean;
}

/**
 * Payload for creating a new agency
 */
export interface AgencyCreatePayload {
  name: string;
  slug?: string;
  description?: MultilingualText;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address: string;
  city_id: string;
  canton_id: string;
  postal_code?: string;
  status?: AgencyStatus;
  is_verified?: boolean;
}

/**
 * Payload for updating an existing agency
 */
export interface AgencyUpdatePayload {
  name?: string;
  slug?: string;
  description?: MultilingualText;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  city_id?: string;
  canton_id?: string;
  postal_code?: string;
  status?: AgencyStatus;
  is_verified?: boolean;
}

/**
 * Payload for updating agency status
 */
export interface AgencyStatusPayload {
  id: string;
  status: AgencyStatus;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Single agency response
 */
export interface AgencyResponse {
  success: boolean;
  data: Agency;
}

/**
 * Paginated list of agencies response
 */
export interface AgencyListResponse {
  agencies: Agency[];
  pagination: PaginationMeta;
}

/**
 * Agency statistics response
 */
export interface AgencyStatistics {
  total: number;
  by_status: {
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
  };
  verified: number;
  unverified: number;
  total_properties: number;
  by_canton: Array<{
    canton_id: string;
    canton_name: string;
    canton_code: string;
    count: number;
  }>;
}

export interface AgencyStatisticsResponse {
  success: boolean;
  data: AgencyStatistics;
}

// =============================================================================
// UI State Types
// =============================================================================

/**
 * Filter state for agency list
 */
export interface AgencyFilters {
  search: string;
  status: AgencyStatus | '';
  canton_id: string;
  city_id: string;
  is_verified: boolean | '';
}

/**
 * Sort state for agency list
 */
export interface AgencySort {
  field: string;
  order: 'asc' | 'desc';
}
