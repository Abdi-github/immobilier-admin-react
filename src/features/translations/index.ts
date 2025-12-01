/**
 * Translations Feature - Public API
 */

// Types
export type {
  PropertyTranslation,
  TranslationApprovalStatus,
  TranslationSource,
  LanguageCode,
  TranslationProperty,
  TranslationQueryParams,
  TranslationApprovePayload,
  TranslationRejectPayload,
  TranslationUpdatePayload,
} from './translations.types';

// API
export {
  translationsApi,
  useGetTranslationsQuery,
  useGetTranslationByIdQuery,
  useApproveTranslationMutation,
  useRejectTranslationMutation,
  useUpdateTranslationMutation,
  useDeleteTranslationMutation,
} from './translationsApi';

// Components
export {
  TranslationList,
  TranslationViewModal,
  TranslationApproveModal,
  TranslationRejectModal,
} from './components';

// Pages
export { TranslationsPage } from './pages';
