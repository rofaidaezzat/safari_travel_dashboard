import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DashboardCounts {
    totalEmployees: number;
    totalUniversities: number;
    totalPartners: number;
    totalLeads: number;
    totalApplications: number;
}

export interface DashboardTrend {
    month: string;
    applications: number;
    leads: number;
}

export interface ApplicationStatus {
    status: string;
    count: number;
}

export interface RecentActivity {
    type: string;
    message: string;
    date: string;
    status?: string;
}

interface ApiResponse<T> {
    status: string;
    code: number;
    message: string;
    data: T;
}

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");
            if (token && token !== "undefined") {
                headers.set("authorization", `Bearer ${token}`);
            }
            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    }),
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboardCounts: builder.query<DashboardCounts, void>({
            query: () => "api/v1/admin/dashboard/counts",
            transformResponse: (response: ApiResponse<DashboardCounts>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getDashboardTrends: builder.query<DashboardTrend[], void>({
            query: () => "api/v1/admin/dashboard/trends",
            transformResponse: (response: ApiResponse<DashboardTrend[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getApplicationStatus: builder.query<ApplicationStatus[], void>({
            query: () => "api/v1/admin/dashboard/application-status",
            transformResponse: (response: ApiResponse<ApplicationStatus[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getRecentActivities: builder.query<RecentActivity[], { page?: number; limit?: number } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                return {
                    url: "api/v1/admin/dashboard/recent-activities",
                    params: { page, limit },
                };
            },
            transformResponse: (response: ApiResponse<RecentActivity[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getDashboardCoursesCount: builder.query<number, void>({
            query: () => ({ url: "api/v1/courses", params: { page: 1, limit: 1 } }),
            transformResponse: (response: { results: number }) => response.results,
            providesTags: ["Dashboard"],
        }),
    }),
});

export const {
    useGetDashboardCountsQuery,
    useGetDashboardTrendsQuery,
    useGetApplicationStatusQuery,
    useGetRecentActivitiesQuery,
    useGetDashboardCoursesCountQuery,
} = dashboardApi;
