import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  EndpointBuilder,
} from '@reduxjs/toolkit/query';
import type { RootState } from '@/app/store';

// Define tag types as a const tuple for better type inference
const tagTypes = [
  'Auth',
  'User',
  'Users',
  'Property',
  'Properties',
  'Agency',
  'Agencies',
  'Category',
  'Categories',
  'Amenity',
  'Amenities',
  'Canton',
  'Cantons',
  'City',
  'Cities',
  'Translation',
  'Translations',
  'Role',
  'Roles',
  'Permission',
  'Permissions',
  'Dashboard',
] as const;

export type ApiTagTypes = (typeof tagTypes)[number];

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const language = localStorage.getItem('i18nextLng') || 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

// Custom base query with token refresh logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 - attempt token refresh
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/public/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store new tokens
        const data = refreshResult.data as {
          data: { accessToken: string; refreshToken: string };
        };
        api.dispatch({
          type: 'auth/setCredentials',
          payload: data.data,
        });

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - logout
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }

  return result;
};

// Base API with automatic token refresh
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: () => ({}),
});

// Export the builder type for use in injected endpoints
export type ApiEndpointBuilder = EndpointBuilder<
  typeof baseQueryWithReauth,
  ApiTagTypes,
  'api'
>;
