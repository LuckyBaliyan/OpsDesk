import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const commentsApiSlice = createApi({
      reducerPath: 'commentsApi',
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
      tagTypes: ['Comment'],
      endpoints: (builder) => ({
            // Ek work item ke saare comments paginated fetch karne ke liye
            getCommentsByWorkItem: builder.query({
                  query: ({ workItemId, page = 1, limit = 50 }) =>
                        `/work-items/${workItemId}/comments?page=${page}&limit=${limit}`,
                  // Response ka data field extract karo (server returns { data, pagination })
                  transformResponse: (response) => response.data || response,
                  providesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
            }),

            // Naya comment add karne ke liye — POST /work-items/:workItemId/comments
            addComment: builder.mutation({
                  query: ({ workItemId, body }) => ({
                        url: `/work-items/${workItemId}/comments`,
                        method: 'POST',
                        body: { body },
                        headers: { 'idempotency-key': `add-comment-${workItemId}-${Date.now()}` },
                  }),
                  // Add ke baad us work item ke comments list refresh karo
                  invalidatesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
            }),

            // Comment update karne ke liye — PATCH /comments/:id
            updateComment: builder.mutation({
                  query: ({ id, body, workItemId }) => ({
                        url: `/comments/${id}`,
                        method: 'PATCH',
                        body: { body },
                        headers: { 'idempotency-key': `update-comment-${id}-${Date.now()}` },
                  }),
                  invalidatesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
            }),

            // Comment delete karne ke liye — DELETE /comments/:id
            deleteComment: builder.mutation({
                  query: ({ id }) => ({
                        url: `/comments/${id}`,
                        method: 'DELETE',
                  }),
                  invalidatesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
            }),
      }),
});

export const {
      useGetCommentsByWorkItemQuery,
      useAddCommentMutation,
      useUpdateCommentMutation,
      useDeleteCommentMutation,
} = commentsApiSlice;
