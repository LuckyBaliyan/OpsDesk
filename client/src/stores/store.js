import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import { teamsApiSlice } from './slices/teamApiSlice.js';
import { workItemsApiSlice } from './slices/workItemsApiSlice.js';
import { commentsApiSlice } from './slices/commentsApiSlice.js';
import { activitiesApiSlice } from './slices/activitiesApiSlice.js';
import { usersApiSlice } from './slices/usersApiSlice.js';

export const store = configureStore({
      reducer: {
            [authSlice.reducerPath]: authSlice.reducer,
            [teamsApiSlice.reducerPath]: teamsApiSlice.reducer,
            [workItemsApiSlice.reducerPath]: workItemsApiSlice.reducer,
            [commentsApiSlice.reducerPath]: commentsApiSlice.reducer,
            [activitiesApiSlice.reducerPath]: activitiesApiSlice.reducer,
            [usersApiSlice.reducerPath]: usersApiSlice.reducer,
            user: userReducer,
      },
      middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                  authSlice.middleware,
                  teamsApiSlice.middleware,
                  workItemsApiSlice.middleware,
                  commentsApiSlice.middleware,
                  activitiesApiSlice.middleware,
                  usersApiSlice.middleware,
            ),
});