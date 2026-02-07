import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface News {
    _id: string;
    title: string;
    category: string;
    image: string;
    coverImage?: string;
    tags?: string[];
    summary: string;
    content: string;
    author: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NewsResponse {
    status: string;
    code: number;
    results: number;
    pagination: {
        currentPage: number;
        limit: number;
        numberOfPages: number;
    };
    data: {
        news: News[];
    };
}

export const newsApi = createApi({
    reducerPath: "newsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://lavishly-fogless-sang.ngrok-free.dev/",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");

            if (token && token !== "undefined") {
                headers.set("authorization", `Bearer ${token}`);
            }

            headers.set("ngrok-skip-browser-warning", "true");
            return headers;
        },
    }),
    tagTypes: ["News"],
    endpoints: (builder) => ({
        createNews: builder.mutation<
            News,
            FormData
        >({
            query: (body) => ({
                url: "api/v1/news",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "News", id: "LIST" }],
            transformResponse: (response: { data: { news: News } }) =>
                response.data.news,
        }),

        getNews: builder.query<
            NewsResponse,
            { page?: number; limit?: number; search?: string; category?: string } | void
        >({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const search = params?.search;
                const category = params?.category;

                const queryParams: Record<string, any> = { page, limit };
                if (search) queryParams.search = search;
                if (category) queryParams.category = category;

                return {
                    url: "api/v1/news",
                    params: queryParams,
                };
            },
            providesTags: (result) =>
                result?.data.news
                    ? [
                        ...result.data.news.map((item) => ({
                            type: "News" as const,
                            id: item._id,
                        })),
                        { type: "News" as const, id: "LIST" },
                    ]
                    : [{ type: "News" as const, id: "LIST" }],
        }),

        getNewsById: builder.query<News, string>({
            query: (id) => ({
                url: `api/v1/news/${id}`,
            }),
            providesTags: (_result, _error, id) => [{ type: "News", id }],
            transformResponse: (response: { data: { news: News } }) =>
                response.data.news,
        }),

        updateNews: builder.mutation<
            News,
            {
                id: string;
                body: FormData;
            }
        >({
            query: ({ id, body }) => ({
                url: `api/v1/news/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "News", id },
                { type: "News", id: "LIST" },
            ],
            transformResponse: (response: { data: { news: News } }) =>
                response.data.news,
        }),

        deleteNews: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/news/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "News", id },
                { type: "News", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetNewsQuery,
    useGetNewsByIdQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;
