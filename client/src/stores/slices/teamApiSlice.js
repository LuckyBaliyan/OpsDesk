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

            // Ek team ke saare members fetch karne ke liye
            getTeamMembers: builder.query({
                  query: (teamId) => `/teams/${teamId}/members`,
                  providesTags: (result, error, teamId) => [{ type: 'Member', id: teamId }],
            }),

            // Naya team create karne ke liye — POST /teams
            createTeam: builder.mutation({
                  query: (body) => ({
                        url: '/teams',
                        method: 'POST',
                        body,
                        headers: { 'idempotency-key': `create-team-${Date.now()}` },
                  }),
                  // Create ke baad team lists refresh karein
                  invalidatesTags: ['Team'],
            }),

            // Team mein member add karne ke liye — POST /teams/:teamId/members
            // Backend expects { email, role } in body — looks up user by email
            addTeamMember: builder.mutation({
                  query: ({ teamId, email, role }) => ({
                        url: `/teams/${teamId}/members`,
                        method: 'POST',
                        body: { email, role },
                        headers: { 'idempotency-key': `add-member-${teamId}-${Date.now()}` },
                  }),
                  // Member add hone ke baad us team ki member list aur Team list refresh ho
                  invalidatesTags: (result, error, { teamId }) => [
                        { type: 'Member', id: teamId },
                        'Team',
                  ],
            }),

            // Team member ka role update karne ke liye — PATCH /teams/:teamId/members/:memberId
            updateTeamMemberRole: builder.mutation({
                  query: ({ teamId, memberId, role }) => ({
                        url: `/teams/${teamId}/members/${memberId}`,
                        method: 'PATCH',
                        body: { role },
                        headers: { 'idempotency-key': `update-role-${teamId}-${memberId}-${Date.now()}` },
                  }),
                  invalidatesTags: (result, error, { teamId }) => [
                        { type: 'Member', id: teamId },
                  ],
            }),
      }),
});

export const {
      useGetAllTeamsQuery,
      useGetUserTeamsQuery,
      useGetTeamMembersQuery,
      useCreateTeamMutation,
      useAddTeamMemberMutation,
      useUpdateTeamMemberRoleMutation,
} = teamsApiSlice;