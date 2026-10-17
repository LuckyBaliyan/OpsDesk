import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authSlice = createApi({
      reducerPath: 'auth',
      baseQuery: fetchBaseQuery({
            baseUrl: `${import.meta.env.VITE_API_URL}/api`,
            prepareHeaders: (headers) => {
                  const token = localStorage.getItem('opsdesk_token');
                  if (token) {
                        headers.set('authorization', `Bearer ${token}`);
                  }
                  return headers;
            },
      }),
      endpoints: (builder) => ({
            loginUser: builder.mutation({
                  query: (credentials) => ({
                        url: '/auth/login',
                        method: 'POST',
                        body: credentials,
                  }),
            }),
            registerUser: builder.mutation({
                  query: (userData) => ({
                        url: '/auth/register',
                        method: 'POST',
                        body: userData,
                  }),
            }),
      }),
});

export const { useLoginUserMutation, useRegisterUserMutation } = authSlice;