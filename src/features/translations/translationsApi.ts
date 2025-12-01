/**
 * Translations API - RTK Query Endpoints
 */

import { api, ApiEndpointBuilder } from '@/shared/api/baseApi';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import {
  PropertyTranslation,
  TranslationQueryParams,
  TranslationApprovePayload,
  TranslationRejectPayload,
  TranslationUpdatePayload,
  TranslationStatistics,
  RequestTranslationsPayload,
  BulkApprovePayload,
  BulkApproveResponse,
  TranslationCreatePayload,
} from './translations.types';

export const translationsApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    /**
     * Get all translations (paginated)
     */
    getTranslations: builder.query<PaginatedResponse<PropertyTranslation>, TranslationQueryParams>({
      query: (params) => ({
        url: '/admin/translations',
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          language: params.language,
          approval_status: params.approval_status,
          source: params.source,
          property_id: params.property_id,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((translation: PropertyTranslation) => ({
                type: 'Translation' as const,
                id: translation.id,
              })),
              { type: 'Translation', id: 'LIST' },
            ]
          : [{ type: 'Translation', id: 'LIST' }],
    }),

    /**
     * Get pending translations
     */
    getPendingTranslations: builder.query<PaginatedResponse<PropertyTranslation>, TranslationQueryParams>({
      query: (params) => ({
        url: '/admin/translations/pending',
        params: {
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          language: params.language,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((translation: PropertyTranslation) => ({
                type: 'Translation' as const,
                id: translation.id,
              })),
              { type: 'Translation', id: 'PENDING' },
            ]
          : [{ type: 'Translation', id: 'PENDING' }],
    }),

    /**
     * Get translation statistics
     */
    getTranslationStatistics: builder.query<ApiResponse<TranslationStatistics>, void>({
      query: () => '/admin/translations/statistics',
      providesTags: [{ type: 'Translation', id: 'STATS' }],
    }),

    /**
     * Get single translation by ID
     */
    getTranslationById: builder.query<ApiResponse<PropertyTranslation>, string>({
      query: (id) => `/admin/translations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Translation', id }],
    }),

    /**
     * Create a new translation
     */
    createTranslation: builder.mutation<ApiResponse<PropertyTranslation>, TranslationCreatePayload>({
      query: (data) => ({
        url: '/admin/translations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),

    /**
     * Approve a translation
     */
    approveTranslation: builder.mutation<ApiResponse<PropertyTranslation>, TranslationApprovePayload>({
      query: ({ id }) => ({
        url: `/admin/translations/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),

    /**
     * Reject a translation
     */
    rejectTranslation: builder.mutation<ApiResponse<PropertyTranslation>, TranslationRejectPayload>({
      query: ({ id, rejection_reason }) => ({
        url: `/admin/translations/${id}/reject`,
        method: 'POST',
        body: { rejection_reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),

    /**
     * Reset translation to pending
     */
    resetTranslation: builder.mutation<ApiResponse<PropertyTranslation>, string>({
      query: (id) => ({
        url: `/admin/translations/${id}/reset`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),

    /**
     * Bulk approve translations
     */
    bulkApproveTranslations: builder.mutation<ApiResponse<BulkApproveResponse>, BulkApprovePayload>({
      query: (data) => ({
        url: '/admin/translations/bulk-approve',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),

    /**
     * Request translations for a property (LibreTranslate)
     */
    requestTranslations: builder.mutation<ApiResponse<PropertyTranslation[]>, RequestTranslationsPayload>({
      query: ({ propertyId, target_languages }) => ({
        url: `/admin/translations/properties/${propertyId}/translations/request`,
        method: 'POST',
        body: { target_languages },
      }),
      invalidatesTags: [
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
        { type: 'Property', id: 'LIST' },
      ],
    }),

    /**
     * Update a translation
     */
    updateTranslation: builder.mutation<
      ApiResponse<PropertyTranslation>,
      { id: string; data: TranslationUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/translations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
      ],
    }),

    /**
     * Delete a translation
     */
    deleteTranslation: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/translations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
        { type: 'Translation', id: 'PENDING' },
        { type: 'Translation', id: 'STATS' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetTranslationsQuery,
  useGetPendingTranslationsQuery,
  useGetTranslationStatisticsQuery,
  useGetTranslationByIdQuery,
  useCreateTranslationMutation,
  useApproveTranslationMutation,
  useRejectTranslationMutation,
  useResetTranslationMutation,
  useBulkApproveTranslationsMutation,
  useRequestTranslationsMutation,
  useUpdateTranslationMutation,
  useDeleteTranslationMutation,
} = translationsApi;

