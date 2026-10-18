import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApiSlice = createApi({
      reducerPath: 'usersApi',
      baseQuery: fetchBaseQuery({
            baseUrl: `${import.meta.env.VITE_API_URL}/api`,
            prepareHeaders: (headers) => {
                  // Har request mein auth token attach karo
                  const token = localStorage.getItem('opsdesk_token');
                  if (token) {
                        headers.set('authorization', `Bearer ${token}`);
                  }
                  return headers;
            },
      }),
      tagTypes: ['User'],
      endpoints: (builder) => ({
            // Saare users fetch karne ke liye — GET /users (optional search query)
            getUsers: builder.query({
                  query: (search = '') =>
                        search ? `/users?search=${encodeURIComponent(search)}` : '/users',
                  providesTags: ['User'],
            }),
      }),
});

export const { useGetUsersQuery } = usersApiSlice;
