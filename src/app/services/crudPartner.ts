import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Partner {
    _id: string;
    name: string;
    logo: string;
    website: string;
    type: string;
    createdAt?: string;
    updatedAt?: string;
}

interface PartnersResponse {
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
        partners: Partner[];
    };
}

export const partnersApi = createApi({
    reducerPath: "partnersApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://api.wasil-edu.com/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");
            if (token && token !== "undefined") {
                headers.set("authorization", `Bearer ${token}`);
            }
            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    }),
    tagTypes: ["Partner"],
    endpoints: (builder) => ({
        getPartners: builder.query<PartnersResponse, { page?: number; limit?: number; sort?: string } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const sort = params?.sort;
                return {
                    url: "api/v1/partners",
                    params: { page, limit, sort },
                };
            },
            providesTags: (result) =>
                result?.data.partners
                    ? [
                        ...result.data.partners.map((partner) => ({
                            type: "Partner" as const,
                            id: partner._id,
                        })),
                        { type: "Partner", id: "LIST" },
                    ]
                    : [{ type: "Partner", id: "LIST" }],
        }),

        createPartner: builder.mutation<Partner, FormData>({
            query: (body) => ({
                url: "api/v1/partners",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Partner", id: "LIST" }],
        }),

        updatePartner: builder.mutation<Partner, { id: string; body: FormData | Partial<Partner> }>({
            query: ({ id, body }) => ({
                url: `api/v1/partners/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Partner", id },
                { type: "Partner", id: "LIST" },
            ],
        }),

        deletePartner: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/partners/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Partner", id },
                { type: "Partner", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetPartnersQuery,
    useCreatePartnerMutation,
    useUpdatePartnerMutation,
    useDeletePartnerMutation,
} = partnersApi;
