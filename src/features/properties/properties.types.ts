// Property Types for Admin Panel

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type TransactionType = 'rent' | 'buy';

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'it';

export interface Property {
  id: string;  // API returns 'id' not '_id'
  _id?: string; // For backwards compatibility
  external_id: string;
  external_url?: string;
  source_language: SupportedLanguage;
  category_id: string;
  agency_id?: string;
  owner_id?: string;
  transaction_type: TransactionType;
  price: number;
  currency: 'CHF';
  additional_costs?: number;
  rooms?: number;
  surface?: number;
  address: string;
  city_id: string;
  canton_id: string;
  postal_code?: string;
  proximity?: Record<string, string>;
  status: PropertyStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Root-level title/description (from current translation based on Accept-Language)
  title?: string;
  description?: string;
  // Current translation object (based on Accept-Language header)
  translation?: {
    title: string;
    description: string;
    source: 'original' | 'deepl' | 'libretranslate' | 'human';
    quality_score?: number;
  };
  // Populated fields
  category?: {
    id: string;
    name: Record<SupportedLanguage, string>;
    section: string;
  };
  city?: {
    id: string;
    name: string | Record<SupportedLanguage, string>;
  };
  canton?: {
    id: string;
    name: string | Record<SupportedLanguage, string>;
    code: string;
  };
  agency?: {
    id: string;
    name: string;
    slug?: string;
  };
  images?: PropertyImage[];
  translations?: PropertyTranslation[]; // Full translations array (only available from translations endpoint)
  amenities?: Amenity[];
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  source?: 'cloudinary' | 'external' | 'local';
}

export interface PropertyTranslation {
  _id: string;
  property_id: string;
  language: SupportedLanguage;
  title: string;
  description: string;
  source: 'original' | 'deepl' | 'human';
  quality_score?: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface Amenity {
  _id?: string;
  id?: string;
  name?: Record<SupportedLanguage, string>;
  is_active?: boolean;
}

// Query Parameters
export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  transaction_type?: TransactionType;
  category_id?: string;
  canton_id?: string;
  city_id?: string;
  agency_id?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// Request DTOs
export interface PropertyCreateDto {
  external_id?: string; // Auto-generated if not provided
  external_url?: string;
  source_language: SupportedLanguage;
  category_id: string;
  agency_id?: string;
  transaction_type: TransactionType;
  price: number;
  additional_costs?: number;
  rooms?: number;
  surface?: number;
  address: string;
  city_id: string;
  canton_id: string;
  postal_code?: string;
  proximity?: Record<string, string>;
  amenities?: string[]; // Array of amenity IDs
  // Source language content
  title: string;
  description: string;
}

export interface PropertyUpdateDto {
  external_url?: string;
  category_id?: string;
  agency_id?: string;
  transaction_type?: TransactionType;
  price?: number;
  additional_costs?: number;
  rooms?: number;
  surface?: number;
  address?: string;
  city_id?: string;
  canton_id?: string;
  postal_code?: string;
  proximity?: Record<string, string>;
  amenities?: string[]; // Array of amenity IDs
}

export interface PropertyRejectDto {
  rejection_reason: string;
}

export interface PropertyStatusUpdateDto {
  status: PropertyStatus;
  rejection_reason?: string;
}

// Response Types - removed PropertyListResponse as API returns properties directly in data array
// Use PaginatedResponse<Property> from shared types instead

export interface PropertyStatistics {
  total: number;
  by_status: Record<PropertyStatus, number>;
  by_transaction_type: Record<TransactionType, number>;
  by_canton: Array<{ canton: string; count: number }>;
  recent_submissions: number;
}
