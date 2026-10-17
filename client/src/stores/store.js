import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice.js';
import userReducer from './slices/userSlice.js';

export const store = configureStore({
      reducer: {
            [authSlice.reducerPath]: authSlice.reducer,
            user: userReducer,
      },
      middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(authSlice.middleware),
});