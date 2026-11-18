import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const commentsApiSlice = createApi({
      reducerPath: 'commentsApi',
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
      tagTypes: ['Comment'],
      endpoints: (builder) => ({
            // Ek work item ke saare comments paginated fetch karne ke liye
            getCommentsByWorkItem: builder.query({
                  query: ({ workItemId, page = 1, limit = 50 }) =>
                        `/work-items/${workItemId}/comments?page=${page}&limit=${limit}`,
                  transformResponse: (response) => response.data || response,
                  providesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
            }),

            // Naya comment add karne ke liye — optimistically thread mein turant push hota hai
            addComment: builder.mutation({
                  query: ({ workItemId, body }) => ({
                        url: `/work-items/${workItemId}/comments`,
                        method: 'POST',
                        body: { body },
                        headers: { 'idempotency-key': `add-comment-${workItemId}-${Date.now()}` },
                  }),
                  invalidatesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
                  async onQueryStarted({ workItemId, body }, { dispatch, getState, queryFulfilled }) {
                        const currentUser = getState().user?.user;
                        const tempId = `temp-${Date.now()}`;

                        // Optimistic comment item
                        const optimisticComment = {
                              id: tempId,
                              body,
                              workItemId,
                              createdAt: new Date().toISOString(),
                              authorId: currentUser?.id || 'me',
                              author: {
                                    id: currentUser?.id || 'me',
                                    name: currentUser?.name || 'You',
                                    email: currentUser?.email || '',
                              },
                        };

                        // Work item ke sabhi active comment query caches ko update karein
                        const patches = [];
                        const queries = getState().commentsApi.queries || {};
                        for (const { endpointName, originalArgs } of Object.values(queries)) {
                              if (endpointName === 'getCommentsByWorkItem' && originalArgs?.workItemId === workItemId) {
                                    const patch = dispatch(
                                          commentsApiSlice.util.updateQueryData('getCommentsByWorkItem', originalArgs, (draft) => {
                                                if (Array.isArray(draft)) {
                                                      draft.push(optimisticComment);
                                                }
                                          })
                                    );
                                    patches.push(patch);
                              }
                        }

                        try {
                              const { data: serverComment } = await queryFulfilled;
                              // Server response aane par temporary ID wale item ko actual server data se swap karein
                              if (serverComment?.id) {
                                    for (const { endpointName, originalArgs } of Object.values(getState().commentsApi.queries || {})) {
                                          if (endpointName === 'getCommentsByWorkItem' && originalArgs?.workItemId === workItemId) {
                                                dispatch(
                                                      commentsApiSlice.util.updateQueryData('getCommentsByWorkItem', originalArgs, (draft) => {
                                                            if (Array.isArray(draft)) {
                                                                  const idx = draft.findIndex((c) => c.id === tempId);
                                                                  if (idx !== -1) {
                                                                        draft[idx] = serverComment;
                                                                  }
                                                            }
                                                      })
                                                );
                                          }
                                    }
                              }
                        } catch {
                              // Network ya authorization failure par changes revert karein
                              patches.forEach((p) => p.undo());
                        }
                  },
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
                  async onQueryStarted({ id, body, workItemId }, { dispatch, getState, queryFulfilled }) {
                        const patches = [];
                        const queries = getState().commentsApi.queries || {};
                        for (const { endpointName, originalArgs } of Object.values(queries)) {
                              if (endpointName === 'getCommentsByWorkItem' && (!workItemId || originalArgs?.workItemId === workItemId)) {
                                    const patch = dispatch(
                                          commentsApiSlice.util.updateQueryData('getCommentsByWorkItem', originalArgs, (draft) => {
                                                if (Array.isArray(draft)) {
                                                      const target = draft.find((c) => c.id === id);
                                                      if (target) target.body = body;
                                                }
                                          })
                                    );
                                    patches.push(patch);
                              }
                        }

                        try {
                              await queryFulfilled;
                        } catch {
                              patches.forEach((p) => p.undo());
                        }
                  },
            }),

            // Comment delete karne ke liye — DELETE /comments/:id (instant cache removal)
            deleteComment: builder.mutation({
                  query: ({ id }) => ({
                        url: `/comments/${id}`,
                        method: 'DELETE',
                  }),
                  invalidatesTags: (result, error, { workItemId }) => [
                        { type: 'Comment', id: workItemId },
                  ],
                  async onQueryStarted({ id, workItemId }, { dispatch, getState, queryFulfilled }) {
                        const patches = [];
                        const queries = getState().commentsApi.queries || {};
                        for (const { endpointName, originalArgs } of Object.values(queries)) {
                              if (endpointName === 'getCommentsByWorkItem' && (!workItemId || originalArgs?.workItemId === workItemId)) {
                                    const patch = dispatch(
                                          commentsApiSlice.util.updateQueryData('getCommentsByWorkItem', originalArgs, (draft) => {
                                                if (Array.isArray(draft)) {
                                                      const idx = draft.findIndex((c) => c.id === id);
                                                      if (idx !== -1) draft.splice(idx, 1);
                                                }
                                          })
                                    );
                                    patches.push(patch);
                              }
                        }

                        try {
                              await queryFulfilled;
                        } catch {
                              // Deletion reject hone par wapis revert karein
                              patches.forEach((p) => p.undo());
                        }
                  },
            }),
      }),
});

export const {
      useGetCommentsByWorkItemQuery,
      useAddCommentMutation,
      useUpdateCommentMutation,
      useDeleteCommentMutation,
} = commentsApiSlice;
