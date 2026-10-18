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
            // Global work items fetch karne ke liye (/work-items/all)
            getAllWorkItems: builder.query({
                  query: () => '/work-items/all',
                  transformResponse: (response) => response.data || response,
                  providesTags: ['WorkItem'],
            }),

            // Specific team ke work items ke liye
            getTeamWorkItems: builder.query({
                  query: (teamId) => `/teams/${teamId}/work-items`,
                  transformResponse: (response) => response.data || response,
                  providesTags: (result, error, teamId) => [{ type: 'WorkItem', id: teamId }],
            }),

            // Single work item by id (details, assignee, createdBy, activities included)
            getWorkItemById: builder.query({
                  query: (id) => `/work-items/${id}`,
                  providesTags: (result, error, id) => [{ type: 'WorkItem', id }],
            }),

            // Naya work item create karne ke liye — POST /work-items
            createWorkItem: builder.mutation({
                  query: (body) => ({
                        url: '/work-items',
                        method: 'POST',
                        body,
                        // Idempotency key required by server middleware
                        headers: { 'idempotency-key': `create-wi-${Date.now()}` },
                  }),
                  // Create ke baad saari lists invalidate karein taaki fresh data aaye
                  invalidatesTags: ['WorkItem'],
            }),

            // Existing work item update karne ke liye — PATCH /work-items/:id
            updateWorkItem: builder.mutation({
                  query: ({ id, ...body }) => ({
                        url: `/work-items/${id}`,
                        method: 'PATCH',
                        body,
                        headers: { 'idempotency-key': `update-wi-${id}-${Date.now()}` },
                  }),
                  // Update ke baad list aur specific item dono invalidate honge
                  invalidatesTags: (result, error, { id }) => [
                        'WorkItem',
                        { type: 'WorkItem', id },
                  ],
            }),

            // Work item delete karne ke liye — DELETE /work-items/:id
            deleteWorkItem: builder.mutation({
                  query: (id) => ({
                        url: `/work-items/${id}`,
                        method: 'DELETE',
                  }),
                  invalidatesTags: ['WorkItem'],
            }),
      }),
});

export const {
      useGetAllWorkItemsQuery,
      useGetTeamWorkItemsQuery,
      useGetWorkItemByIdQuery,
      useCreateWorkItemMutation,
      useUpdateWorkItemMutation,
      useDeleteWorkItemMutation,
} = workItemsApiSlice;