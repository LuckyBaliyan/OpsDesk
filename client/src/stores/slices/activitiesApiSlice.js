import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const activitiesApiSlice = createApi({
      reducerPath: 'activitiesApi',
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
      tagTypes: ['Activity'],
      endpoints: (builder) => ({
            // Ek work item ke activity / audit logs paginated fetch karne ke liye
            getWorkItemActivities: builder.query({
                  query: ({ workItemId, page = 1, limit = 20 }) =>
                        `/work-items/${workItemId}/activities?page=${page}&limit=${limit}`,
                  // Server returns { data: [...], pagination: {...} } — extract data
                  transformResponse: (response) => response.data || response,
                  providesTags: (result, error, { workItemId }) => [
                        { type: 'Activity', id: workItemId },
                  ],
            }),
      }),
});

export const { useGetWorkItemActivitiesQuery } = activitiesApiSlice;
