/**
 * Categories Feature Types
 */

/**
 * Multilingual text for category names
 */
export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

/**
 * Category Section Types
 */
export type CategorySection = 'residential' | 'commercial' | 'land' | 'parking' | 'special';

/**
 * Available category sections
 */
export const CATEGORY_SECTIONS: CategorySection[] = [
  'residential',
  'commercial',
  'land',
  'parking',
  'special',
];

/**
 * Category interface
 */
export interface Category {
  id: string;
  section: CategorySection;
  slug: string;
  name: MultilingualText;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Category query parameters
 */
export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  is_active?: boolean;
  section?: CategorySection;
  search?: string;
}

/**
 * Category create payload
 */
export interface CategoryCreatePayload {
  section: CategorySection;
  slug: string;
  name: MultilingualText;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Category update payload
 */
export interface CategoryUpdatePayload {
  section?: CategorySection;
  slug?: string;
  name?: MultilingualText;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Categories grouped by section (type for data structure)
 */
export interface CategoriesBySectionGroup {
  section: CategorySection;
  categories: Category[];
}
