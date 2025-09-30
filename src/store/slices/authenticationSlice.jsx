import { createSlice } from '@reduxjs/toolkit';

const accessTokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const refreshTokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const initialState = {
  isAuthenticated: Boolean(accessTokenFromStorage),
  user: null,
  accessToken: accessTokenFromStorage,
  refreshToken: refreshTokenFromStorage,
};

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload || {};
      state.isAuthenticated = Boolean(accessToken);
      state.user = user || null;
      state.accessToken = accessToken || null;
      state.refreshToken = refreshToken || null;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { login, logout } = authenticationSlice.actions;

export default authenticationSlice.reducer;