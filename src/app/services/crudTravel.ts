import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Travel {
    _id: string;
    fullname: string;
    phonenumber: string;
    whatsapp: string;
    from: string;
    to: string;
    address: string;
    date: string;
    passengers: {
        adults: number;
        children: number;
    };
    type: string;
    status?: string;
    is_assigned?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TravelsResponse {
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
        travels: Travel[];
    };
}

export const travelApi = createApi({
    reducerPath: "travelApi",
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
    tagTypes: ["Travel"],
    endpoints: (builder) => ({
        createTravel: builder.mutation<Travel, Partial<Travel>>({
            query: (body) => ({
                url: "api/v1/travels",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Travel", id: "LIST" }],
            // transformResponse not strictly needed if backend returns just the created object or we stick to standard
            // but based on user prompt inputs, we might just need void or specific response. 
            // The prompt didn't show CREATE response, but usually it matches GetById. 
            // We'll leave transformResponse out for now or assume standard return.
        }),

        getTravels: builder.query<
            TravelsResponse,
            { page?: number; limit?: number; search?: string; type?: string; sort?: string } | void
        >({
            queryFn: async (params, _api, _extraOptions, baseQuery) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const search = params?.search;
                const type = params?.type;
                const sort = params?.sort;

                const queryParams: Record<string, any> = { page, limit };
                if (search) queryParams.search = search;
                if (type && type !== "all") queryParams.type = type;
                if (sort) queryParams.sort = sort;

                // Construct URL correctly with params
                const queryString = new URLSearchParams(queryParams).toString();
                const url = `api/v1/travels?${queryString}`;

                const result = await baseQuery({ url });

                if (result.error) {
                    if (result.error.status === 404) {
                        // Return empty list on 404
                        return {
                            data: {
                                status: "success",
                                code: 200,
                                message: "No travels found",
                                results: 0,
                                pagination: {
                                    currentPage: page,
                                    limit: limit,
                                    numberOfPages: 0,
                                },
                                data: {
                                    travels: [],
                                },
                            },
                        };
                    }
                }

                return result as { data: TravelsResponse };
            },
            providesTags: (result) =>
                result?.data?.travels
                    ? [
                        ...result.data.travels.map((item) => ({
                            type: "Travel" as const,
                            id: item._id,
                        })),
                        { type: "Travel" as const, id: "LIST" },
                    ]
                    : [{ type: "Travel" as const, id: "LIST" }],
        }),

        getTravelById: builder.query<Travel, string>({
            query: (id) => ({
                url: `api/v1/travels/${id}`,
            }),
            providesTags: (_result, _error, id) => [{ type: "Travel", id }],
            transformResponse: (response: { data: Travel }) => response.data,
        }),

        updateTravel: builder.mutation<
            Travel,
            {
                id: string;
                body: Partial<Travel>;
            }
        >({
            query: ({ id, body }) => ({
                url: `api/v1/travels/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Travel", id },
                { type: "Travel", id: "LIST" },
            ],
            // Assuming the update response is the object itself or wrapped similar to create
        }),

        assignTravel: builder.mutation<Travel, { id: string; assignedTo: string }>({
            query: ({ id, assignedTo }) => ({
                url: `api/v1/travels/${id}/assign`,
                method: "PATCH",
                body: { assignedTo },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Travel", id },
                { type: "Travel", id: "LIST" },
            ],
        }),

        updateTravelStatus: builder.mutation<Travel, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `api/v1/travels/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Travel", id },
                { type: "Travel", id: "LIST" },
            ],
        }),

        deleteTravel: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/travels/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Travel", id },
                { type: "Travel", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetTravelsQuery,
    useGetTravelByIdQuery,
    useCreateTravelMutation,
    useUpdateTravelMutation,
    useDeleteTravelMutation,
    useAssignTravelMutation,
    useUpdateTravelStatusMutation,
} = travelApi;
