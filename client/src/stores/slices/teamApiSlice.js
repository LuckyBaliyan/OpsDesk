import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const teamsApiSlice = createApi({
      reducerPath: 'teamsApi',
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
      tagTypes: ['Team', 'Member'],
      endpoints: (builder) => ({
            // Saari teams (Organization overview ke liye)
            getAllTeams: builder.query({
                  query: () => '/teams',
                  providesTags: ['Team'],
            }),
            // Sirf user se related teams (Sidebar ke liye)
            getUserTeams: builder.query({
                  query: () => '/user/teams',
                  providesTags: ['Team'],
            }),
            getTeamMembers: builder.query({
                  query: (teamId) => `/teams/${teamId}/members`,
                  providesTags: (result, error, teamId) => [{ type: 'Member', id: teamId }],
            }),
      }),
});

export const { useGetAllTeamsQuery, useGetUserTeamsQuery, useGetTeamMembersQuery } = teamsApiSlice;