/**
 * Roles API
 *
 * RTK Query endpoints for Roles & Permissions management.
 * Uses the api base from shared/api/baseApi.ts
 */

import { api, ApiEndpointBuilder } from '@/shared/api/baseApi';
import type { ApiResponse, NestedPaginatedResponse } from '@/shared/types/api.types';
import type {
  Role,
  RoleQueryParams,
  RoleCreatePayload,
  RoleUpdatePayload,
  Permission,
  PermissionQueryParams,
  PermissionCreatePayload,
  PermissionUpdatePayload,
  PermissionsByResource,
  PermissionAssignPayload,
} from './roles.types';

// =============================================================================
// Role Endpoints
// =============================================================================

export const rolesApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // =========================================================================
    // Role CRUD
    // =========================================================================

    /**
     * Get paginated list of roles
     */
    getRoles: builder.query<NestedPaginatedResponse<Role>, RoleQueryParams | void>({
      query: (params) => ({
        url: '/admin/roles',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((role: Role) => ({
                type: 'Role' as const,
                id: role.id,
              })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    /**
     * Get single role by ID
     */
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/admin/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    /**
     * Create a new role
     */
    createRole: builder.mutation<ApiResponse<Role>, RoleCreatePayload>({
      query: (body) => ({
        url: '/admin/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    /**
     * Update an existing role
     */
    updateRole: builder.mutation<ApiResponse<Role>, { id: string; data: RoleUpdatePayload }>({
      query: ({ id, data }) => ({
        url: `/admin/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    /**
     * Delete a role
     */
    deleteRole: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // =========================================================================
    // Role Permission Management
    // =========================================================================

    /**
     * Get permissions for a specific role
     */
    getRolePermissions: builder.query<ApiResponse<Permission[]>, string>({
      query: (id) => `/admin/roles/${id}/permissions`,
      providesTags: (_result, _error, id) => [{ type: 'Role', id: `${id}-permissions` }],
    }),

    /**
     * Set permissions for a role (replaces all)
     */
    setRolePermissions: builder.mutation<ApiResponse<Role>, PermissionAssignPayload>({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: `${id}-permissions` },
      ],
    }),

    /**
     * Assign additional permissions to a role
     */
    assignRolePermissions: builder.mutation<ApiResponse<Role>, PermissionAssignPayload>({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions/assign`,
        method: 'POST',
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: `${id}-permissions` },
      ],
    }),

    /**
     * Revoke permissions from a role
     */
    revokeRolePermissions: builder.mutation<ApiResponse<Role>, PermissionAssignPayload>({
      query: ({ id, permissions }) => ({
        url: `/admin/roles/${id}/permissions/revoke`,
        method: 'POST',
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: `${id}-permissions` },
      ],
    }),

    // =========================================================================
    // Permission CRUD
    // =========================================================================

    /**
     * Get paginated list of permissions
     */
    getPermissions: builder.query<NestedPaginatedResponse<Permission>, PermissionQueryParams | void>(
      {
        query: (params) => ({
          url: '/admin/permissions',
          params: params || {},
        }),
        providesTags: (result) =>
          result?.data?.data
            ? [
                ...result.data.data.map((perm: Permission) => ({
                  type: 'Permission' as const,
                  id: perm.id,
                })),
                { type: 'Permission', id: 'LIST' },
              ]
            : [{ type: 'Permission', id: 'LIST' }],
      }
    ),

    /**
     * Get single permission by ID
     */
    getPermission: builder.query<ApiResponse<Permission>, string>({
      query: (id) => `/admin/permissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Permission', id }],
    }),

    /**
     * Create a new permission
     */
    createPermission: builder.mutation<ApiResponse<Permission>, PermissionCreatePayload>({
      query: (body) => ({
        url: '/admin/permissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Permission', id: 'LIST' },
        { type: 'Permission', id: 'GROUPED' },
        { type: 'Permission', id: 'RESOURCES' },
      ],
    }),

    /**
     * Update an existing permission
     */
    updatePermission: builder.mutation<
      ApiResponse<Permission>,
      { id: string; data: PermissionUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/permissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Permission', id },
        { type: 'Permission', id: 'LIST' },
        { type: 'Permission', id: 'GROUPED' },
      ],
    }),

    /**
     * Delete a permission
     */
    deletePermission: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/admin/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Permission', id: 'LIST' },
        { type: 'Permission', id: 'GROUPED' },
        { type: 'Permission', id: 'RESOURCES' },
      ],
    }),

    // =========================================================================
    // Permission Utility Endpoints
    // =========================================================================

    /**
     * Get all unique resources
     */
    getPermissionResources: builder.query<ApiResponse<string[]>, void>({
      query: () => '/admin/permissions/resources',
      providesTags: [{ type: 'Permission', id: 'RESOURCES' }],
    }),

    /**
     * Get permissions grouped by resource
     */
    getPermissionsGrouped: builder.query<ApiResponse<PermissionsByResource[]>, void>({
      query: () => '/admin/permissions/grouped',
      providesTags: [{ type: 'Permission', id: 'GROUPED' }],
    }),

    /**
     * Get all active permissions (for dropdowns/selects)
     */
    getAllActivePermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => '/admin/permissions/active',
      providesTags: [{ type: 'Permission', id: 'ACTIVE' }],
    }),

    /**
     * Get permissions by resource name
     */
    getPermissionsByResource: builder.query<ApiResponse<Permission[]>, string>({
      query: (resource) => `/admin/permissions/resource/${resource}`,
      providesTags: (_result, _error, resource) => [
        { type: 'Permission', id: `resource-${resource}` },
      ],
    }),
  }),
});

// Export hooks
export const {
  // Role hooks
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  useAssignRolePermissionsMutation,
  useRevokeRolePermissionsMutation,
  // Permission hooks
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetPermissionResourcesQuery,
  useGetPermissionsGroupedQuery,
  useGetAllActivePermissionsQuery,
  useGetPermissionsByResourceQuery,
} = rolesApi;
