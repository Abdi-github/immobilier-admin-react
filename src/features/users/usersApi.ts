import { api, type ApiEndpointBuilder } from '@/shared/api/baseApi';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type {
  User,
  UserQueryParams,
  UserCreateDto,
  UserUpdateDto,
  UserStatistics,
  UserStatusUpdateDto,
} from './users.types';

export const usersApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    // Get all users with filters
    getUsers: builder.query<PaginatedResponse<User>, UserQueryParams>({
      query: (params: UserQueryParams) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: (result: PaginatedResponse<User> | undefined) =>
        result?.data
          ? [
              ...result.data.map(({ id }: { id: string }) => ({
                type: 'User' as const,
                id,
              })),
              { type: 'Users' as const, id: 'LIST' },
            ]
          : [{ type: 'Users' as const, id: 'LIST' }],
    }),

    // Get user statistics
    getUserStatistics: builder.query<ApiResponse<UserStatistics>, void>({
      query: () => '/admin/users/statistics',
      providesTags: ['Dashboard'],
    }),

    // Get single user
    getUser: builder.query<ApiResponse<User>, string>({
      query: (id: string) => `/admin/users/${id}`,
      providesTags: (
        _result: ApiResponse<User> | undefined,
        _error: unknown,
        id: string
      ) => [{ type: 'User' as const, id }],
    }),

    // Create user
    createUser: builder.mutation<ApiResponse<User>, UserCreateDto>({
      query: (body: UserCreateDto) => ({
        url: '/admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),

    // Update user
    updateUser: builder.mutation<
      ApiResponse<User>,
      { id: string; data: UserUpdateDto }
    >({
      query: ({ id, data }: { id: string; data: UserUpdateDto }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (
        _result: ApiResponse<User> | undefined,
        _error: unknown,
        { id }: { id: string; data: UserUpdateDto }
      ) => [
        { type: 'User' as const, id },
        { type: 'Users' as const, id: 'LIST' },
      ],
    }),

    // Update user status
    updateUserStatus: builder.mutation<
      ApiResponse<User>,
      { id: string; data: UserStatusUpdateDto }
    >({
      query: ({ id, data }: { id: string; data: UserStatusUpdateDto }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (
        _result: ApiResponse<User> | undefined,
        _error: unknown,
        { id }: { id: string; data: UserStatusUpdateDto }
      ) => [
        { type: 'User' as const, id },
        { type: 'Users' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Suspend user
    suspendUser: builder.mutation<ApiResponse<User>, string>({
      query: (id: string) => ({
        url: `/admin/users/${id}/suspend`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<User> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'User' as const, id },
        { type: 'Users' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Activate user
    activateUser: builder.mutation<ApiResponse<User>, string>({
      query: (id: string) => ({
        url: `/admin/users/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: (
        _result: ApiResponse<User> | undefined,
        _error: unknown,
        id: string
      ) => [
        { type: 'User' as const, id },
        { type: 'Users' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id: string) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserStatisticsQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} = usersApi;
