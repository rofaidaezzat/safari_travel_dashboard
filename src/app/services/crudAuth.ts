import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('accessToken');
            console.log('DEBUG: Token from localStorage:', token);

            if (token && token !== 'undefined') {
                headers.set('authorization', `Bearer ${token}`);
                console.log('DEBUG: Authorization Header set to:', `Bearer ${token}`);
            } else {
                console.warn('DEBUG: No token found in localStorage for auth request');
            }

            headers.set('ngrok-skip-browser-warning', 'true');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({ email, password }) => ({
                url: 'api/v1/employees/login',
                method: 'POST',
                body: { email, password },
            }),
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: 'api/v1/employees/logout',
                method: 'GET',
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
