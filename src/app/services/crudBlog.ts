import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Blog {
    _id: string;
    title: string;
    coverImage: string;
    content: string;
    author: string;
    tags: string[];
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BlogsResponse {
    status: string;
    code: number;
    results: number;
    pagination: {
        currentPage: number;
        limit: number;
        numberOfPages: number;
    };
    data: {
        blogs: Blog[];
    };
}

export const blogApi = createApi({
    reducerPath: "blogApi",
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
    tagTypes: ["Blog"],
    endpoints: (builder) => ({
        createBlog: builder.mutation<
            Blog,
            FormData
        >({
            query: (body) => ({
                url: "api/v1/blogs",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Blog", id: "LIST" }],
            transformResponse: (response: { data: Blog }) => response.data,
        }),

        getBlogs: builder.query<
            BlogsResponse,
            { page?: number; limit?: number; search?: string } | void
        >({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const search = params?.search;

                const queryParams: Record<string, any> = { page, limit };
                if (search) queryParams.search = search;

                return {
                    url: "api/v1/blogs",
                    params: queryParams,
                };
            },
            providesTags: (result) =>
                result?.data.blogs
                    ? [
                        ...result.data.blogs.map((item) => ({
                            type: "Blog" as const,
                            id: item._id,
                        })),
                        { type: "Blog" as const, id: "LIST" },
                    ]
                    : [{ type: "Blog" as const, id: "LIST" }],
        }),

        getBlogById: builder.query<Blog, string>({
            query: (id) => ({
                url: `api/v1/blogs/${id}`,
            }),
            providesTags: (_result, _error, id) => [{ type: "Blog", id }],
            transformResponse: (response: { data: Blog }) => response.data,
        }),

        updateBlog: builder.mutation<
            Blog,
            {
                id: string;
                body: FormData;
            }
        >({
            query: ({ id, body }) => ({
                url: `api/v1/blogs/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Blog", id },
                { type: "Blog", id: "LIST" },
            ],
            transformResponse: (response: { data: Blog }) => response.data,
        }),

        deleteBlog: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/blogs/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Blog", id },
                { type: "Blog", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogByIdQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApi;
