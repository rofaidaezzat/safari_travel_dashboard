import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Course {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    universities: Array<{
        _id: string;
        name: string;
        country: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

interface CoursesResponse {
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
        courses: Course[];
    };
}

export const coursesApi = createApi({
    reducerPath: "coursesApi",
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
    tagTypes: ["Course"],
    endpoints: (builder) => ({
        getCourses: builder.query<CoursesResponse, { page?: number; limit?: number; sort?: string; keyword?: string; university?: string } | void>({
            query: (params) => {
                const page = params?.page ?? 1;
                const limit = params?.limit ?? 10;
                const sort = params?.sort;
                const keyword = params?.keyword;
                const university = params?.university;
                
                const queryParams: Record<string, string | number> = { page, limit };
                if (sort) queryParams.sort = sort;
                if (keyword) queryParams.keyword = keyword;
                if (university) queryParams.university = university;

                return {
                    url: "api/v1/courses",
                    params: queryParams,
                };
            },
            providesTags: (result) =>
                result?.data.courses
                    ? [
                        ...result.data.courses.map((course) => ({
                            type: "Course" as const,
                            id: course._id,
                        })),
                        { type: "Course", id: "LIST" },
                    ]
                    : [{ type: "Course", id: "LIST" }],
        }),

        getCourseById: builder.query<Course, string>({
            query: (id) => ({
                url: `api/v1/courses/${id}`,
            }),
            transformResponse: (response: { data: Course }) => response.data,
            providesTags: (_result, _error, id) => [{ type: "Course", id }],
        }),

        createCourse: builder.mutation<Course, any>({
            query: (body) => ({
                url: "api/v1/courses",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Course", id: "LIST" }],
        }),

        updateCourse: builder.mutation<Course, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `api/v1/courses/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "Course", id },
                { type: "Course", id: "LIST" },
            ],
        }),

        deleteCourse: builder.mutation<void, string>({
            query: (id) => ({
                url: `api/v1/courses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "Course", id },
                { type: "Course", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetCoursesQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
} = coursesApi;
