import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';
import { teamsApiSlice } from './slices/teamApiSlice.js';
import { workItemsApiSlice } from './slices/workItemsApiSlice.js';

export const store = configureStore({
      reducer: {
            [authSlice.reducerPath]: authSlice.reducer,
            [teamsApiSlice.reducerPath]: teamsApiSlice.reducer,
            [workItemsApiSlice.reducerPath]: workItemsApiSlice.reducer,
            user: userReducer,
      },
      middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(authSlice.middleware, teamsApiSlice.middleware, workItemsApiSlice.middleware),
});