import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface SocialMediaLink {
  _id?: string; // returned by server, must be stripped before PATCH
  title: string;
  link: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  // Admin-only fields
  social_media_links?: SocialMediaLink[];
  phone_num?: string;
  whats_num?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileBody {
  social_media_links?: SocialMediaLink[];
  phone_num?: string;
  whats_num?: string;
  address?: string;
}

interface EmployeesResponse {
  status: string;
  code: number;
  results: number;
  pagination: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
  };
  data: {
    employees: Employee[];
  };
}

export const employeesApi = createApi({
  reducerPath: "employeesApi",
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
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    createEmployee: builder.mutation<
      Employee,
      { name: string; email: string; password: string; role: string }
    >({
      query: (body) => ({
        url: "api/v1/employees/register",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
      transformResponse: (response: { data: { employee: Employee } }) =>
        response.data.employee,
    }),

    getEmployees: builder.query<
      EmployeesResponse,
      { page?: number; limit?: number; sort?: string; status?: string; role?: string } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const sort = params?.sort;
        const status = params?.status;
        const role = params?.role;

        const queryParams: Record<string, any> = { page, limit };
        if (sort) queryParams.sort = sort;
        if (status) queryParams.is_active = status;
        if (role) queryParams.role = role;

        return {
          url: "api/v1/employees",
          params: queryParams,
        };
      },
      providesTags: (result) =>
        result?.data.employees
          ? [
            ...result.data.employees.map((emp) => ({
              type: "Employee" as const,
              id: emp._id,
            })),
            { type: "Employee" as const, id: "LIST" },
          ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => ({
        url: `api/v1/employees/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
      transformResponse: (response: { data: Employee }) =>
        response.data,
    }),

    updateEmployee: builder.mutation<
      Employee,
      {
        id: string;
        body: Partial<Pick<Employee, "name" | "email" | "role" | "is_active">>;
      }
    >({
      query: ({ id, body }) => ({
        url: `api/v1/employees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
      transformResponse: (response: { data: { employee: Employee } }) =>
        response.data.employee,
    }),

    updateAdminProfile: builder.mutation<Employee, { id: string; body: AdminProfileBody }>({
      query: ({ id, body }) => ({
        url: `api/v1/employees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
      transformResponse: (response: { data: { employee: Employee } }) =>
        response.data.employee,
    }),

    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `api/v1/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  useUpdateAdminProfileMutation,
  useDeleteEmployeeMutation,
  useCreateEmployeeMutation,
} = employeesApi;

