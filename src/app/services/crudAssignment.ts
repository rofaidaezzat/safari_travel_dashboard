import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AssignedItem {
    _id: string;
    assigned_to: string;
    item_type: "Application" | "Travel" | "Lead";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item_id: any;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface AssignmentsResponse {
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
        assignments: AssignedItem[];
    };
}

export const assignmentsApi = createApi({
    reducerPath: "assignmentsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://safary-kappa.vercel.app/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");
            if (token && token !== "undefined") {
                headers.set("authorization", `Bearer ${token}`);
            }
            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    }),
    tagTypes: ["Assignment"],
    endpoints: (builder) => ({
        getMyAssignments: builder.query<AssignmentsResponse, { page?: number; limit?: number } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                return {
                    url: "api/v1/assigned/my",
                    params: { page, limit },
                };
            },
            providesTags: ["Assignment"],
        }),



        updateAssignmentStatus: builder.mutation<AssignedItem, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `api/v1/assigned/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Assignment"],
        }),
    }),
});

export const { useGetMyAssignmentsQuery, useUpdateAssignmentStatusMutation } = assignmentsApi;
