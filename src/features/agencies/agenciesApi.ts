/**
 * Agencies API
 *
 * RTK Query endpoints for the Agencies admin feature.
 * Handles all agency-related API calls with proper caching and invalidation.
 */

import { api, type ApiEndpointBuilder } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type {
  Agency,
  AgencyStatistics,
  AgencyQueryParams,
  AgencyCreatePayload,
  AgencyUpdatePayload,
  AgencyStatusPayload,
} from './agencies.types';

export const agenciesApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // =========================================================================
    // Query Endpoints
    // =========================================================================

    /**
     * Get paginated list of agencies with filters
     */
    getAgencies: builder.query<PaginatedResponse<Agency>, AgencyQueryParams>({
      query: (params: AgencyQueryParams) => {
        return {
          url: '/admin/agencies',
          params: {
            ...params,
            include_inactive: params.include_inactive ?? true,
          },
        };
      },
      providesTags: (result: PaginatedResponse<Agency> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({
                type: 'Agency' as const,
                id,
              })),
              { type: 'Agencies' as const, id: 'LIST' },
            ]
          : [{ type: 'Agencies' as const, id: 'LIST' }],
    }),

    /**
     * Get agency statistics
     */
    getAgencyStatistics: builder.query<ApiResponse<AgencyStatistics>, void>({
      query: () => '/admin/agencies/statistics',
      providesTags: ['Dashboard'],
    }),

    /**
     * Get a single agency by ID
     */
    getAgency: builder.query<ApiResponse<Agency>, string>({
      query: (id: string) => `/admin/agencies/${id}`,
      providesTags: (
        _result: ApiResponse<Agency> | undefined,
        _error: unknown,
        id: string
      ) => [{ type: 'Agency' as const, id }],
    }),

    // =========================================================================
    // Mutation Endpoints
    // =========================================================================

    /**
     * Create a new agency
     */
    createAgency: builder.mutation<ApiResponse<Agency>, AgencyCreatePayload>({
      query: (body: AgencyCreatePayload) => ({
        url: '/admin/agencies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Agencies', id: 'LIST' }, 'Dashboard'],
    }),

    /**
     * Update an existing agency
     */
    updateAgency: builder.mutation<
      ApiResponse<Agency>,
      { id: string; data: AgencyUpdatePayload }
    >({
      query: ({ id, data }: { id: string; data: AgencyUpdatePayload }) => ({
        url: `/admin/agencies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (
        _result: ApiResponse<Agency> | undefined,
        _error: unknown,
        { id }: { id: string }
      ) => [
        { type: 'Agency' as const, id },
        { type: 'Agencies' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Delete an agency
     */
    deleteAgency: builder.mutation<ApiResponse<null>, string>({
      query: (id: string) => ({
        url: `/admin/agencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result: ApiResponse<null> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Agency' as const, id },
        { type: 'Agencies' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Verify an agency
     */
    verifyAgency: builder.mutation<ApiResponse<Agency>, string>({
      query: (id: string) => ({
        url: `/admin/agencies/${id}/verify`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<Agency> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Agency' as const, id },
        { type: 'Agencies' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Unverify an agency
     */
    unverifyAgency: builder.mutation<ApiResponse<Agency>, string>({
      query: (id: string) => ({
        url: `/admin/agencies/${id}/unverify`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<Agency> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Agency' as const, id },
        { type: 'Agencies' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    /**
     * Update agency status
     */
    updateAgencyStatus: builder.mutation<ApiResponse<Agency>, AgencyStatusPayload>({
      query: ({ id, status }: AgencyStatusPayload) => ({
        url: `/admin/agencies/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (
        _result: ApiResponse<Agency> | undefined,
        _error: unknown,
        { id }: { id: string }
      ) => [
        { type: 'Agency' as const, id },
        { type: 'Agencies' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Queries
  useGetAgenciesQuery,
  useGetAgencyStatisticsQuery,
  useGetAgencyQuery,
  // Mutations
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useVerifyAgencyMutation,
  useUnverifyAgencyMutation,
  useUpdateAgencyStatusMutation,
} = agenciesApi;
