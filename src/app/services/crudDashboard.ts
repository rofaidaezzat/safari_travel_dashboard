import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://safary-kappa.vercel.app/api/v1/admin/dashboard";

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
        baseUrl,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    }),
    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboardCounts: builder.query<DashboardCounts, void>({
            query: () => "/counts",
            transformResponse: (response: ApiResponse<DashboardCounts>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getDashboardTrends: builder.query<DashboardTrend[], void>({
            query: () => "/trends",
            transformResponse: (response: ApiResponse<DashboardTrend[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getApplicationStatus: builder.query<ApplicationStatus[], void>({
            query: () => "/application-status",
            transformResponse: (response: ApiResponse<ApplicationStatus[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
        getRecentActivities: builder.query<RecentActivity[], { page?: number; limit?: number } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                return {
                    url: "/recent-activities",
                    params: { page, limit },
                };
            },
            transformResponse: (response: ApiResponse<RecentActivity[]>) => response.data,
            providesTags: ["Dashboard"],
        }),
    }),
});

export const {
    useGetDashboardCountsQuery,
    useGetDashboardTrendsQuery,
    useGetApplicationStatusQuery,
    useGetRecentActivitiesQuery,
} = dashboardApi;
