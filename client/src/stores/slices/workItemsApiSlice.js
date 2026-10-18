import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const workItemsApiSlice = createApi({
      reducerPath: 'workItemsApi',
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
      tagTypes: ['WorkItem'],
      endpoints: (builder) => ({
            // Saari teams ya global work items ke liye
            getAllWorkItems: builder.query({
                  query: () => '/work-items',
                  transformResponse: (response) => response.data || response,
                  providesTags: ['WorkItem'],
            }),
            // Specific team ke work items ke liye (jaise response mein 'data' array aata hai)
            getTeamWorkItems: builder.query({
                  query: (teamId) => `/teams/${teamId}/work-items`,
                  transformResponse: (response) => response.data || response,
                  providesTags: (result, error, teamId) => [{ type: 'WorkItem', id: teamId }],
            }),
      }),
});

export const { useGetAllWorkItemsQuery, useGetTeamWorkItemsQuery } = workItemsApiSlice;