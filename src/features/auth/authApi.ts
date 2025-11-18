import { api, type ApiEndpointBuilder } from '@/shared/api/baseApi';
import type { ApiResponse } from '@/shared/types';
import type { User } from './authSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface TokensResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface LoginResponse {
  user: User;
  tokens: TokensResponse;
}

interface RefreshRequest {
  refresh_token: string;
}

interface RefreshResponse {
  tokens: TokensResponse;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder: ApiEndpointBuilder) => ({
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials: LoginRequest) => {
        return {
          url: '/public/auth/login',
          method: 'POST',
          body: credentials,
        };
      },
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
        } catch (error) {
        }
      },
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => {
        return {
          url: '/public/auth/logout',
          method: 'POST',
        };
      },
      invalidatesTags: ['Auth'],
    }),
    refreshToken: builder.mutation<ApiResponse<RefreshResponse>, RefreshRequest>({
      query: (body: RefreshRequest) => {
        return {
          url: '/public/auth/refresh',
          method: 'POST',
          body,
        };
      },
    }),
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => {
        return '/public/auth/me';
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
} = authApi;
