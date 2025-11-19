/**
 * Categories API - RTK Query Endpoints
 */

import { api, ApiEndpointBuilder } from '@/shared/api/baseApi';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import {
  Category,
  CategoryQueryParams,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategorySection,
} from './categories.types';

export const categoriesApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // ==================== Public Endpoints ====================

    /**
     * Get all categories (paginated)
     */
    getCategories: builder.query<PaginatedResponse<Category>, CategoryQueryParams>({
      query: (params) => {
        return {
          url: '/public/categories',
          params: {
            page: params.page,
            limit: params.limit,
            sort: params.sort,
            is_active: params.is_active,
            section: params.section,
          search: params.search,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((category: Category) => ({
                type: 'Category' as const,
                id: category.id,
              })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    /**
     * Get single category by ID
     */
    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/public/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),

    /**
     * Get category by slug
     */
    getCategoryBySlug: builder.query<ApiResponse<Category>, string>({
      query: (slug) => `/public/categories/slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Category', id: result.data.id }] : [],
    }),

    /**
     * Get categories by section
     */
    getCategoriesBySection: builder.query<ApiResponse<Category[]>, CategorySection>({
      query: (section) => `/public/categories/section/${section}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((category: Category) => ({
                type: 'Category' as const,
                id: category.id,
              })),
              { type: 'Category', id: 'SECTION' },
            ]
          : [{ type: 'Category', id: 'SECTION' }],
    }),

    // ==================== Admin Endpoints ====================

    /**
     * Create a new category (Admin)
     */
    createCategory: builder.mutation<ApiResponse<Category>, CategoryCreatePayload>({
      query: (body) => ({
        url: '/admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'SECTION' },
      ],
    }),

    /**
     * Update a category (Admin)
     */
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: string; data: CategoryUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'SECTION' },
      ],
    }),

    /**
     * Delete a category (Admin)
     */
    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Category', id: 'LIST' },
        { type: 'Category', id: 'SECTION' },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Public
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useGetCategoriesBySectionQuery,
  // Admin
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
