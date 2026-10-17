import { createSlice } from '@reduxjs/toolkit';

// Initial state mein check karo agar pehle se token/user stored hai
const initialState = {
      token: localStorage.getItem('opsdesk_token') || null,
      user: JSON.parse(localStorage.getItem('opsdesk_user')) || null,
};

export const userSlice = createSlice({
      name: 'user',
      initialState,
      reducers: {
            setCredentials: (state, action) => {
                  const { token, user } = action.payload;
                  state.token = token;
                  state.user = user;

                  // LocalStorage mein persist karo taaki refresh karne par data na ude
                  localStorage.setItem('opsdesk_token', token);
                  localStorage.setItem('opsdesk_user', JSON.stringify(user));
            },
            logout: (state) => {
                  state.token = null;
                  state.user = null;

                  // Storage clear karo
                  localStorage.removeItem('opsdesk_token');
                  localStorage.removeItem('opsdesk_user');
            },
      },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer;

// Selectors (user data read karne ke liye)
export const selectCurrentToken = (state) => state.user.token;
export const selectCurrentUser = (state) => state.user.user;