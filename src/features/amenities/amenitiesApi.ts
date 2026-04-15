/**
 * Amenities API - RTK Query Endpoints
 */

import { api, ApiEndpointBuilder } from '@/shared/api/baseApi';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import {
  Amenity,
  AmenityQueryParams,
  AmenityCreatePayload,
  AmenityUpdatePayload,
  AmenityGroup,
} from './amenities.types';

export const amenitiesApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // ==================== Public Endpoints ====================

    /**
     * Get all amenities (paginated)
     */
    getAmenities: builder.query<PaginatedResponse<Amenity>, AmenityQueryParams>({
      query: (params) => ({
        url: '/public/amenities',
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          is_active: params.is_active,
          group: params.group,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((amenity: Amenity) => ({
                type: 'Amenity' as const,
                id: amenity.id,
              })),
              { type: 'Amenity', id: 'LIST' },
            ]
          : [{ type: 'Amenity', id: 'LIST' }],
    }),

    /**
     * Get single amenity by ID
     */
    getAmenityById: builder.query<ApiResponse<Amenity>, string>({
      query: (id) => `/public/amenities/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Amenity', id }],
    }),

    /**
     * Get amenities by group
     */
    getAmenitiesByGroup: builder.query<ApiResponse<Amenity[]>, AmenityGroup>({
      query: (group) => `/public/amenities/group/${group}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((amenity: Amenity) => ({
                type: 'Amenity' as const,
                id: amenity.id,
              })),
              { type: 'Amenity', id: 'GROUP' },
            ]
          : [{ type: 'Amenity', id: 'GROUP' }],
    }),

    // ==================== Admin Endpoints ====================

    /**
     * Create a new amenity (Admin)
     */
    createAmenity: builder.mutation<ApiResponse<Amenity>, AmenityCreatePayload>({
      query: (body) => ({
        url: '/admin/amenities',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Amenity', id: 'LIST' },
        { type: 'Amenity', id: 'GROUP' },
      ],
    }),

    /**
     * Update an amenity (Admin)
     */
    updateAmenity: builder.mutation<
      ApiResponse<Amenity>,
      { id: string; data: AmenityUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/amenities/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Amenity', id },
        { type: 'Amenity', id: 'LIST' },
        { type: 'Amenity', id: 'GROUP' },
      ],
    }),

    /**
     * Delete an amenity (Admin)
     */
    deleteAmenity: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/amenities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Amenity', id: 'LIST' },
        { type: 'Amenity', id: 'GROUP' },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Public
  useGetAmenitiesQuery,
  useGetAmenityByIdQuery,
  useGetAmenitiesByGroupQuery,
  // Admin
  useCreateAmenityMutation,
  useUpdateAmenityMutation,
  useDeleteAmenityMutation,
} = amenitiesApi;
