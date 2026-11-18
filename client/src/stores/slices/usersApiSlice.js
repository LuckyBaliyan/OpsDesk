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
            // Saare users fetch karne ke liye — GET /users (supports search query aur teamId filter)
            getUsers: builder.query({
                  query: (arg = '') => {
                        if (typeof arg === 'string') {
                              return arg ? `/users?search=${encodeURIComponent(arg)}` : '/users';
                        }
                        const params = new URLSearchParams();
                        if (arg?.search) params.append('search', arg.search);
                        if (arg?.teamId && arg.teamId !== 'all') params.append('teamId', arg.teamId);
                        const qs = params.toString();
                        return qs ? `/users?${qs}` : '/users';
                  },
                  providesTags: ['User'],
            }),
      }),
});

export const { useGetUsersQuery } = usersApiSlice;
