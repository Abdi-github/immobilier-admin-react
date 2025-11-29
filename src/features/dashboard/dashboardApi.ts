import { api } from '@/shared/api/baseApi';
import type { ApiResponse } from '@/shared/types';

export interface DashboardStats {
  totalProperties: number;
  pendingApproval: number;
  publishedProperties: number;
  activeAgencies: number;
  totalUsers: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
