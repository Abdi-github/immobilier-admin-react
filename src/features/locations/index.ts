/**
 * Locations Feature - Public API
 */

// Types
export type {
  Canton,
  City,
  MultilingualText,
  CantonQueryParams,
  CityQueryParams,
  CantonCreatePayload,
  CantonUpdatePayload,
  CityCreatePayload,
  CityUpdatePayload,
} from './locations.types';

// API
export {
  locationsApi,
  useGetCantonsQuery,
  useGetCantonByIdQuery,
  useGetCantonByCodeQuery,
  useCreateCantonMutation,
  useUpdateCantonMutation,
  useDeleteCantonMutation,
  useGetCitiesQuery,
  useGetCityByIdQuery,
  useGetCitiesByCantonIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} from './locationsApi';

// Components
export {
  CantonList,
  CityList,
  CantonFormModal,
  CityFormModal,
  CantonDeleteModal,
  CityDeleteModal,
} from './components';

// Pages
export { LocationsPage } from './pages';
