/**
 * Locations Feature Types
 */

/**
 * Multilingual text for location names
 */
export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

/**
 * Canton interface
 */
export interface Canton {
  id: string;
  code: string;
  name: MultilingualText;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * City interface
 */
export interface City {
  id: string;
  canton_id: string;
  canton?: Canton;
  name: MultilingualText;
  postal_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Canton query parameters
 */
export interface CantonQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  is_active?: boolean;
  code?: string;
  search?: string;
}

/**
 * City query parameters
 */
export interface CityQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  is_active?: boolean;
  canton_id?: string;
  postal_code?: string;
  search?: string;
}

/**
 * Canton create payload
 */
export interface CantonCreatePayload {
  code: string;
  name: MultilingualText;
  is_active?: boolean;
}

/**
 * Canton update payload
 */
export interface CantonUpdatePayload {
  code?: string;
  name?: MultilingualText;
  is_active?: boolean;
}

/**
 * City create payload
 */
export interface CityCreatePayload {
  canton_id: string;
  name: MultilingualText;
  postal_code: string;
  is_active?: boolean;
}

/**
 * City update payload
 */
export interface CityUpdatePayload {
  canton_id?: string;
  name?: MultilingualText;
  postal_code?: string;
  is_active?: boolean;
}
