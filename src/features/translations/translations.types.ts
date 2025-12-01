/**
 * Translations Feature Types
 */

/**
 * Translation approval status
 */
export type TranslationApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Translation source
 */
export type TranslationSource = 'original' | 'deepl' | 'human' | 'machine';

/**
 * Language code
 */
export type LanguageCode = 'en' | 'fr' | 'de' | 'it';

/**
 * Property reference within translation
 */
export interface TranslationProperty {
  id: string;
  external_id: string;
  source_language: LanguageCode;
  address?: string;
  price?: number;
  status?: string;
}

/**
 * Property Translation interface
 */
export interface PropertyTranslation {
  id: string;
  property_id: string;
  property?: TranslationProperty;
  language: LanguageCode;
  title: string;
  description: string;
  source: TranslationSource;
  quality_score?: number;
  approval_status: TranslationApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Translation query parameters
 */
export interface TranslationQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  language?: LanguageCode;
  approval_status?: TranslationApprovalStatus;
  source?: TranslationSource;
  property_id?: string;
  search?: string;
}

/**
 * Translation approval payload
 */
export interface TranslationApprovePayload {
  id: string;
}

/**
 * Translation rejection payload
 */
export interface TranslationRejectPayload {
  id: string;
  rejection_reason: string;
}

/**
 * Translation update payload
 */
export interface TranslationUpdatePayload {
  title?: string;
  description?: string;
  quality_score?: number;
}

/**
 * Translation statistics response
 */
export interface TranslationStatistics {
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}

/**
 * Request translations payload
 */
export interface RequestTranslationsPayload {
  propertyId: string;
  target_languages?: LanguageCode[];
}

/**
 * Request translations response
 */
export interface RequestTranslationsResponse {
  translations: PropertyTranslation[];
  message: string;
}

/**
 * Bulk approve payload
 */
export interface BulkApprovePayload {
  ids: string[];
}

/**
 * Bulk approve response
 */
export interface BulkApproveResponse {
  approved: number;
  failed: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Translation create payload
 */
export interface TranslationCreatePayload {
  property_id: string;
  language: LanguageCode;
  title: string;
  description: string;
  source?: TranslationSource;
  quality_score?: number;
}
