import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { activitiesApiSlice } from './activitiesApiSlice.js';

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
                  async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                        try {
                              const { data } = await queryFulfilled;
                              if (data?.id) {
                                    dispatch(activitiesApiSlice.util.invalidateTags([
                                          'Activity',
                                          { type: 'Activity', id: data.id }
                                    ]));
                              }
                        } catch {}
                  },
            }),

            // Existing work item update karne ke liye — optimistic updates ke sath PATCH /work-items/:id
            updateWorkItem: builder.mutation({
                  query: ({ id, assignee, ...body }) => ({
                        url: `/work-items/${id}`,
                        method: 'PATCH',
                        body,
                        headers: { 'idempotency-key': `update-wi-${id}-${Date.now()}` },
                  }),
                  // Tag invalidation intentionally empty taaki refetch storm aur skeleton loader na aaye;
                  // Cache onQueryStarted mein instant update hoti hai aur queryFulfilled par server response se reconcile hoti hai.
                  invalidatesTags: [],
                  // Status, Priority aur Assignment ko instant local update karein
                  async onQueryStarted({ id, ...body }, { dispatch, getState, queryFulfilled }) {
                        // 1. Single item cache (detail page) update karein
                        const patchDetail = dispatch(
                              workItemsApiSlice.util.updateQueryData('getWorkItemById', id, (draft) => {
                                    const target = draft?.data || draft;
                                    if (target) {
                                          if (body.status !== undefined) target.status = body.status;
                                          if (body.priority !== undefined) target.priority = body.priority;
                                          if (body.assigneeId !== undefined) {
                                                target.assigneeId = body.assigneeId;
                                                if (body.assignee !== undefined) {
                                                      target.assignee = body.assignee;
                                                } else if (body.assigneeId === null) {
                                                      target.assignee = null;
                                                }
                                          }
                                          if (body.title !== undefined) target.title = body.title;
                                          if (body.description !== undefined) target.description = body.description;
                                    }
                              })
                        );

                        // 2. Global work items cache (dashboard list & metrics) update karein
                        const patchAll = dispatch(
                              workItemsApiSlice.util.updateQueryData('getAllWorkItems', undefined, (draft) => {
                                    const list = Array.isArray(draft) ? draft : (draft?.data ?? []);
                                    const item = list.find((w) => w.id === id);
                                    if (item) {
                                          if (body.status !== undefined) item.status = body.status;
                                          if (body.priority !== undefined) item.priority = body.priority;
                                          if (body.assigneeId !== undefined) {
                                                item.assigneeId = body.assigneeId;
                                                if (body.assignee !== undefined) {
                                                      item.assignee = body.assignee;
                                                } else if (body.assigneeId === null) {
                                                      item.assignee = null;
                                                }
                                          }
                                          if (body.title !== undefined) item.title = body.title;
                                          if (body.description !== undefined) item.description = body.description;
                                    }
                              })
                        );

                        // 3. Team-specific caches update karein
                        const teamPatches = [];
                        const queries = getState().workItemsApi.queries || {};
                        for (const { endpointName, originalArgs } of Object.values(queries)) {
                              if (endpointName === 'getTeamWorkItems' && originalArgs) {
                                    const p = dispatch(
                                          workItemsApiSlice.util.updateQueryData('getTeamWorkItems', originalArgs, (draft) => {
                                                const list = Array.isArray(draft) ? draft : (draft?.data ?? []);
                                                const item = list.find((w) => w.id === id);
                                                if (item) {
                                                      if (body.status !== undefined) item.status = body.status;
                                                      if (body.priority !== undefined) item.priority = body.priority;
                                                      if (body.assigneeId !== undefined) {
                                                            item.assigneeId = body.assigneeId;
                                                            if (body.assignee !== undefined) {
                                                                  item.assignee = body.assignee;
                                                            } else if (body.assigneeId === null) {
                                                                  item.assignee = null;
                                                            }
                                                      }
                                                      if (body.title !== undefined) item.title = body.title;
                                                      if (body.description !== undefined) item.description = body.description;
                                                }
                                          })
                                    );
                                    teamPatches.push(p);
                              }
                        }

                        try {
                              const { data: serverItem } = await queryFulfilled;
                              const actualItem = serverItem?.data || serverItem;

                              // Server response aane par actual data (updated version, timestamps, etc.) cache mein sync karein
                              if (actualItem?.id) {
                                    dispatch(
                                          workItemsApiSlice.util.updateQueryData('getWorkItemById', actualItem.id, (draft) => {
                                                const target = draft?.data || draft;
                                                if (target) Object.assign(target, actualItem);
                                          })
                                    );
                                    dispatch(
                                          workItemsApiSlice.util.updateQueryData('getAllWorkItems', undefined, (draft) => {
                                                const list = Array.isArray(draft) ? draft : (draft?.data ?? []);
                                                const idx = list.findIndex((w) => w.id === actualItem.id);
                                                if (idx !== -1) {
                                                      list[idx] = { ...list[idx], ...actualItem };
                                                }
                                          })
                                    );
                                    for (const { endpointName, originalArgs } of Object.values(getState().workItemsApi.queries || {})) {
                                          if (endpointName === 'getTeamWorkItems' && originalArgs) {
                                                dispatch(
                                                      workItemsApiSlice.util.updateQueryData('getTeamWorkItems', originalArgs, (draft) => {
                                                            const list = Array.isArray(draft) ? draft : (draft?.data ?? []);
                                                            const idx = list.findIndex((w) => w.id === actualItem.id);
                                                            if (idx !== -1) {
                                                                  list[idx] = { ...list[idx], ...actualItem };
                                                            }
                                                      })
                                                );
                                          }
                                    }
                              }

                              if (id) {
                                    dispatch(activitiesApiSlice.util.invalidateTags([
                                          'Activity',
                                          { type: 'Activity', id }
                                    ]));
                              }
                        } catch {
                              // Concurrency conflict ya permission error par changes revert karein
                              patchDetail.undo();
                              patchAll.undo();
                              teamPatches.forEach((p) => p.undo());
                        }
                  },
            }),

            // Work item delete karne ke liye — DELETE /work-items/:id
            deleteWorkItem: builder.mutation({
                  query: (id) => ({
                        url: `/work-items/${id}`,
                        method: 'DELETE',
                  }),
                  invalidatesTags: ['WorkItem'],
                  async onQueryStarted(id, { dispatch, queryFulfilled }) {
                        try {
                              await queryFulfilled;
                              if (id) {
                                    dispatch(activitiesApiSlice.util.invalidateTags([
                                          'Activity',
                                          { type: 'Activity', id }
                                    ]));
                              }
                        } catch {}
                  },
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