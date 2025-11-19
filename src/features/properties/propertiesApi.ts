import { api, type ApiEndpointBuilder } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type {
  Property,
  PropertyQueryParams,
  PropertyCreateDto,
  PropertyUpdateDto,
  PropertyRejectDto,
  PropertyStatistics,
  PropertyStatusUpdateDto,
  PropertyImage,
} from './properties.types';

export const propertiesApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // Get all properties with filters
    getProperties: builder.query<
      PaginatedResponse<Property>,
      PropertyQueryParams
    >({
      query: (params: PropertyQueryParams) => {
        return {
          url: '/admin/properties',
          params,
        };
      },
      providesTags: (result: PaginatedResponse<Property> | undefined) =>
        result?.data
        ? [
          ...result.data.map(({ id }: { id: string }) => ({
            type: 'Property' as const,
            id,
          })),
          { type: 'Properties' as const, id: 'LIST' },
        ]
        : [{ type: 'Properties' as const, id: 'LIST' }],
      
    }),

    // Get property statistics
    getPropertyStatistics: builder.query<ApiResponse<PropertyStatistics>, void>(
      {
        query: () => {
          return '/admin/properties/statistics';
        },
        providesTags: ['Dashboard'],
      }
    ),

    // Get single property
    getProperty: builder.query<ApiResponse<Property>, string>({
      query: (id: string) => {
        return `/admin/properties/${id}`;
      },
      providesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        id: string
      ) => [{ type: 'Property' as const, id }],
    }),

    // Create property
    createProperty: builder.mutation<ApiResponse<Property>, PropertyCreateDto>({
      query: (body: PropertyCreateDto) => {
        return {
          url: '/admin/properties',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),

    // Update property
    updateProperty: builder.mutation<
      ApiResponse<Property>,
      { id: string; data: PropertyUpdateDto }
    >({
      query: ({ id, data }: { id: string; data: PropertyUpdateDto }) => {
        return {
          url: `/admin/properties/${id}`,
          method: 'PUT',
          body: data,
        };
      },
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        { id }: { id: string; data: PropertyUpdateDto }
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
      ],
    }),

    // Delete property
    deleteProperty: builder.mutation<ApiResponse<null>, string>({
      query: (id: string) => {
        return {
          url: `/admin/properties/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: [{ type: 'Properties', id: 'LIST' }, 'Dashboard'],
    }),

    // Submit for approval (DRAFT -> PENDING_APPROVAL)
    submitProperty: builder.mutation<ApiResponse<Property>, string>({
      query: (id: string) => {
        return {
          url: `/admin/properties/${id}/submit`,
          method: 'POST',
        };
      },
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Approve property (PENDING_APPROVAL -> APPROVED)
    approveProperty: builder.mutation<ApiResponse<Property>, string>({
      query: (id: string) => ({
        url: `/admin/properties/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Reject property (PENDING_APPROVAL -> REJECTED)
    rejectProperty: builder.mutation<
      ApiResponse<Property>,
      { id: string; data: PropertyRejectDto }
    >({
      query: ({ id, data }: { id: string; data: PropertyRejectDto }) => ({
        url: `/admin/properties/${id}/reject`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        { id }: { id: string; data: PropertyRejectDto }
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Publish property (APPROVED -> PUBLISHED)
    publishProperty: builder.mutation<ApiResponse<Property>, string>({
      query: (id: string) => ({
        url: `/admin/properties/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Archive property (PUBLISHED -> ARCHIVED)
    archiveProperty: builder.mutation<ApiResponse<Property>, string>({
      query: (id: string) => ({
        url: `/admin/properties/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Update status directly
    updatePropertyStatus: builder.mutation<
      ApiResponse<Property>,
      { id: string; data: PropertyStatusUpdateDto }
    >({
      query: ({ id, data }: { id: string; data: PropertyStatusUpdateDto }) => ({
        url: `/admin/properties/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (
        _result: ApiResponse<Property> | undefined,
        _error: unknown,
        { id }: { id: string; data: PropertyStatusUpdateDto }
      ) => [
        { type: 'Property' as const, id },
        { type: 'Properties' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Upload single image
    uploadPropertyImage: builder.mutation<
      ApiResponse<PropertyImage>,
      { propertyId: string; formData: FormData }
    >({
      query: ({ propertyId, formData }) => ({
        url: `/admin/properties/${propertyId}/images/upload`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (
        _result: ApiResponse<PropertyImage> | undefined,
        _error: unknown,
        { propertyId }
      ) => [{ type: 'Property' as const, id: propertyId }],
    }),

    // Upload multiple images
    uploadPropertyImages: builder.mutation<
      ApiResponse<PropertyImage[]>,
      { propertyId: string; formData: FormData }
    >({
      query: ({ propertyId, formData }) => ({
        url: `/admin/properties/${propertyId}/images/upload-multiple`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (
        _result: ApiResponse<PropertyImage[]> | undefined,
        _error: unknown,
        { propertyId }
      ) => [{ type: 'Property' as const, id: propertyId }],
    }),

    // Delete property image
    deletePropertyImage: builder.mutation<
      ApiResponse<null>,
      { propertyId: string; imageId: string }
    >({
      query: ({ propertyId, imageId }) => ({
        url: `/admin/properties/${propertyId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (
        _result: ApiResponse<null> | undefined,
        _error: unknown,
        { propertyId }
      ) => [{ type: 'Property' as const, id: propertyId }],
    }),

    // Set primary image
    setPrimaryImage: builder.mutation<
      ApiResponse<PropertyImage>,
      { propertyId: string; imageId: string }
    >({
      query: ({ propertyId, imageId }) => ({
        url: `/admin/properties/${propertyId}/images/${imageId}/primary`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<PropertyImage> | undefined,
        _error: unknown,
        { propertyId }
      ) => [{ type: 'Property' as const, id: propertyId }],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyStatisticsQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useSubmitPropertyMutation,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  usePublishPropertyMutation,
  useArchivePropertyMutation,
  useUpdatePropertyStatusMutation,
  useUploadPropertyImageMutation,
  useUploadPropertyImagesMutation,
  useDeletePropertyImageMutation,
  useSetPrimaryImageMutation,
} = propertiesApi;
