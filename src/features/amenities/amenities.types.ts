/**
 * Amenities Feature Types
 */

/**
 * Multilingual text for amenity names
 */
export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

/**
 * Amenity Group Types
 */
export type AmenityGroup =
  | 'general'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor'
  | 'security'
  | 'parking'
  | 'accessibility'
  | 'energy'
  | 'other';

/**
 * Available amenity groups
 */
export const AMENITY_GROUPS: AmenityGroup[] = [
  'general',
  'kitchen',
  'bathroom',
  'outdoor',
  'security',
  'parking',
  'accessibility',
  'energy',
  'other',
];

/**
 * Amenity interface
 */
export interface Amenity {
  id: string;
  name: MultilingualText;
  group: AmenityGroup;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Amenity query parameters
 */
export interface AmenityQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  is_active?: boolean;
  group?: AmenityGroup;
  search?: string;
}

/**
 * Amenity create payload
 */
export interface AmenityCreatePayload {
  name: MultilingualText;
  group: AmenityGroup;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Amenity update payload
 */
export interface AmenityUpdatePayload {
  name?: MultilingualText;
  group?: AmenityGroup;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Amenities grouped by group (type for data structure)
 */
export interface AmenitiesByGroupData {
  group: AmenityGroup;
  amenities: Amenity[];
}
