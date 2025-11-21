/**
 * Agencies Feature Module
 *
 * Public exports for the agencies feature.
 */

// Types
export type {
  Agency,
  AgencyStatus,
  AgencyQueryParams,
  AgencyCreatePayload,
  AgencyUpdatePayload,
  AgencyStatistics,
  AgencyFilters,
} from './agencies.types';

// API hooks
export {
  useGetAgenciesQuery,
  useGetAgencyStatisticsQuery,
  useGetAgencyQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useVerifyAgencyMutation,
  useUnverifyAgencyMutation,
  useUpdateAgencyStatusMutation,
} from './agenciesApi';

// Components
export {
  AgencyStatusBadge,
  AgencyVerifiedBadge,
  AgencyList,
  AgencyDetails,
  AgencyFormModal,
  AgencyActions,
} from './components';

// Pages
export { AgenciesPage, AgencyDetailPage } from './pages';
