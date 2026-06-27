import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Lead {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: "New" | "Contacted" | "Closed";
    createdAt: string;
    updatedAt: string;
}

interface LeadsResponse {
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
        leads: Lead[];
    };
}

export const leadsApi = createApi({
    reducerPath: "leadsApi",
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
    tagTypes: ["Lead"],
    endpoints: (builder) => ({
        getLeads: builder.query<LeadsResponse, { page?: number; limit?: number; sort?: string } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const sort = params?.sort;
                return {
                    url: "api/v1/leads",
                    params: { page, limit, sort },
                };
            },
            providesTags: (result) =>
                result?.data.leads
                    ? [
                        ...result.data.leads.map((lead) => ({
                            type: "Lead" as const,
                            id: lead._id,
                        })),
                        { type: "Lead", id: "LIST" },
                    ]
                    : [{ type: "Lead", id: "LIST" }],
        }),

        createLead: builder.mutation<Lead, Partial<Lead>>({
            query: (body) => ({
                url: "api/v1/leads",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Lead", id: "LIST" }],
        }),

        updateLeadStatus: builder.mutation<Lead, { id: string; status: Lead["status"] }>({
            query: ({ id, status }) => ({
                url: `api/v1/leads/${id}`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Lead", id },
                { type: "Lead", id: "LIST" },
            ],
        }),

        deleteLead: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/leads/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Lead", id },
                { type: "Lead", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetLeadsQuery,
    useCreateLeadMutation,
    useUpdateLeadStatusMutation,
    useDeleteLeadMutation,
} = leadsApi;
