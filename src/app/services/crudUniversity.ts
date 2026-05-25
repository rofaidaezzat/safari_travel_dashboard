import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface University {
    _id: string;
    name: string;
    country: string;
    description: string;
    programs: string[];
    fees: string;
    admissionRequirements: string;
    images: string[];
    videoUrl?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UniversitiesResponse {
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
        universities: University[];
    };
}

export const universitiesApi = createApi({
    reducerPath: "universitiesApi",
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
    tagTypes: ["University"],
    endpoints: (builder) => ({
        getUniversities: builder.query<UniversitiesResponse, { page?: number; limit?: number; sort?: string } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const sort = params?.sort;
                return {
                    url: "api/v1/universities",
                    params: { page, limit, sort },
                };
            },
            providesTags: (result) =>
                result?.data.universities
                    ? [
                        ...result.data.universities.map((uni) => ({
                            type: "University" as const,
                            id: uni._id,
                        })),
                        { type: "University", id: "LIST" },
                    ]
                    : [{ type: "University", id: "LIST" }],
        }),

        getUniversityById: builder.query<University, string>({
            query: (id) => ({
                url: `api/v1/universities/${id}`,
            }),
            transformResponse: (response: { data: University }) => response.data,
            providesTags: (_result, _error, id) => [{ type: "University", id }],
        }),

        createUniversity: builder.mutation<University, FormData>({
            query: (body) => ({
                url: "api/v1/universities",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "University", id: "LIST" }],
        }),

        updateUniversity: builder.mutation<University, { id: string; body: FormData | object }>({
            query: ({ id, body }) => ({
                url: `api/v1/universities/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "University", id },
                { type: "University", id: "LIST" },
            ],
        }),

        deleteUniversity: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/universities/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "University", id },
                { type: "University", id: "LIST" },
            ],
        }),

        uploadUniversityImage: builder.mutation<void, { id: string; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `api/v1/universities/${id}/image`,
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "University", id },
                { type: "University", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetUniversitiesQuery,
    useGetUniversityByIdQuery,
    useCreateUniversityMutation,
    useUpdateUniversityMutation,
    useDeleteUniversityMutation,
    useUploadUniversityImageMutation,
} = universitiesApi;
