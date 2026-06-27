import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Application {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
    nationality: string;
    passportNumber: string;
    graduationYear: string;
    highSchoolGrade: string;
    desiredMajor: string;
    desiredCountry: string;
    desiredUniversity: string;
    documents: string[];
    status: string; // broadened to accept "Pending", "In Progress" etc.
    is_assigned?: boolean;
    assignedTo?: any;
    createdAt: string;
    updatedAt: string;
}

interface ApplicationsResponse {
    status: string;
    code: number;
    message: string;
    results: number;
    pagination: {
        currentPage: number;
        limit: number;
        numberOfPages: number;
    };
    data: {
        applications: Application[];
    };
}

export const applicationsApi = createApi({
    reducerPath: "applicationsApi",
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
    tagTypes: ["Application"],
    endpoints: (builder) => ({
        getApplications: builder.query<ApplicationsResponse, { page?: number; limit?: number; sort?: string } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const sort = params?.sort;
                return {
                    url: "api/v1/applications",
                    params: { page, limit, sort },
                };
            },
            providesTags: (result) =>
                result?.data.applications
                    ? [
                        ...result.data.applications.map((app) => ({
                            type: "Application" as const,
                            id: app._id,
                        })),
                        { type: "Application", id: "LIST" },
                    ]
                    : [{ type: "Application", id: "LIST" }],
        }),

        getApplicationById: builder.query<Application, string>({
            query: (id) => ({
                url: `api/v1/applications/${id}`,
            }),
            transformResponse: (response: { data: Application }) => response.data,
            providesTags: (_result, _error, id) => [{ type: "Application", id }],
        }),

        createApplication: builder.mutation<Application, FormData>({
            query: (body) => ({
                url: "api/v1/applications",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Application", id: "LIST" }],
        }),

        updateApplicationStatus: builder.mutation<Application, { id: string; status: Application["status"] }>({
            query: ({ id, status }) => ({
                url: `api/v1/assigned/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Application", id },
                { type: "Application", id: "LIST" },
            ],
        }),

        assignApplication: builder.mutation<Application, { id: string; assignedTo: string }>({
            query: ({ id, assignedTo }) => ({
                url: `api/v1/applications/${id}/assign`,
                method: "PATCH",
                body: { assignedTo },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Application", id },
                { type: "Application", id: "LIST" },
            ],
        }),

        deleteApplication: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/applications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, error, id) => {
                if (error && "status" in error && error.status !== 404) {
                    return [];
                }
                return [
                    { type: "Application", id },
                    { type: "Application", id: "LIST" },
                ];
            },
        }),
    }),
});

export const {
    useGetApplicationsQuery,
    useGetApplicationByIdQuery,
    useCreateApplicationMutation,
    useUpdateApplicationStatusMutation,
    useAssignApplicationMutation,
    useDeleteApplicationMutation,
} = applicationsApi;
