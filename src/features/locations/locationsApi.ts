/**
 * Locations API - RTK Query Endpoints
 */

import { api, ApiEndpointBuilder } from '@/shared/api/baseApi';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import {
  Canton,
  City,
  CantonQueryParams,
  CityQueryParams,
  CantonCreatePayload,
  CantonUpdatePayload,
  CityCreatePayload,
  CityUpdatePayload,
} from './locations.types';

export const locationsApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // ==================== Canton Endpoints ====================

    /**
     * Get all cantons (paginated)
     */
    getCantons: builder.query<PaginatedResponse<Canton>, CantonQueryParams>({
      query: (params) => ({
        url: '/public/locations/cantons',
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          is_active: params.is_active,
          code: params.code,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((canton: Canton) => ({
                type: 'Canton' as const,
                id: canton.id,
              })),
              { type: 'Canton', id: 'LIST' },
            ]
          : [{ type: 'Canton', id: 'LIST' }],
    }),

    /**
     * Get single canton by ID
     */
    getCantonById: builder.query<ApiResponse<Canton>, string>({
      query: (id) => `/public/locations/cantons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Canton', id }],
    }),

    /**
     * Get canton by code
     */
    getCantonByCode: builder.query<ApiResponse<Canton>, string>({
      query: (code) => `/public/locations/cantons/code/${code}`,
      providesTags: (result) =>
        result ? [{ type: 'Canton', id: result.data.id }] : [],
    }),

    /**
     * Create a new canton (Admin)
     */
    createCanton: builder.mutation<ApiResponse<Canton>, CantonCreatePayload>({
      query: (body) => ({
        url: '/admin/locations/cantons',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Canton', id: 'LIST' }],
    }),

    /**
     * Update a canton (Admin)
     */
    updateCanton: builder.mutation<
      ApiResponse<Canton>,
      { id: string; data: CantonUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/locations/cantons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Canton', id },
        { type: 'Canton', id: 'LIST' },
      ],
    }),

    /**
     * Delete a canton (Admin)
     */
    deleteCanton: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/locations/cantons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Canton', id },
        { type: 'Canton', id: 'LIST' },
      ],
    }),

    // ==================== City Endpoints ====================

    /**
     * Get all cities (paginated)
     */
    getCities: builder.query<PaginatedResponse<City>, CityQueryParams>({
      query: (params) => ({
        url: '/public/locations/cities',
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          is_active: params.is_active,
          canton_id: params.canton_id,
          postal_code: params.postal_code,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((city: City) => ({
                type: 'City' as const,
                id: city.id,
              })),
              { type: 'City', id: 'LIST' },
            ]
          : [{ type: 'City', id: 'LIST' }],
    }),

    /**
     * Get single city by ID
     */
    getCityById: builder.query<ApiResponse<City>, string>({
      query: (id) => `/public/locations/cities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'City', id }],
    }),

    /**
     * Get cities by canton ID
     */
    getCitiesByCantonId: builder.query<PaginatedResponse<City>, { cantonId: string; params?: CityQueryParams }>({
      query: ({ cantonId, params = {} }) => ({
        url: `/public/locations/cantons/${cantonId}/cities`,
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          is_active: params.is_active,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((city: City) => ({
                type: 'City' as const,
                id: city.id,
              })),
              { type: 'City', id: 'CANTON_LIST' },
            ]
          : [{ type: 'City', id: 'CANTON_LIST' }],
    }),

    /**
     * Create a new city (Admin)
     */
    createCity: builder.mutation<ApiResponse<City>, CityCreatePayload>({
      query: (body) => ({
        url: '/admin/locations/cities',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'City', id: 'LIST' },
        { type: 'City', id: 'CANTON_LIST' },
      ],
    }),

    /**
     * Update a city (Admin)
     */
    updateCity: builder.mutation<
      ApiResponse<City>,
      { id: string; data: CityUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/locations/cities/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'City', id },
        { type: 'City', id: 'LIST' },
        { type: 'City', id: 'CANTON_LIST' },
      ],
    }),

    /**
     * Delete a city (Admin)
     */
    deleteCity: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/locations/cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'City', id },
        { type: 'City', id: 'LIST' },
        { type: 'City', id: 'CANTON_LIST' },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Canton hooks
  useGetCantonsQuery,
  useGetCantonByIdQuery,
  useGetCantonByCodeQuery,
  useCreateCantonMutation,
  useUpdateCantonMutation,
  useDeleteCantonMutation,
  // City hooks
  useGetCitiesQuery,
  useGetCityByIdQuery,
  useGetCitiesByCantonIdQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = locationsApi;
