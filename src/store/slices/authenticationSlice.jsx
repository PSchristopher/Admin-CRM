import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const accessTokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
const refreshTokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
const userFromStorage = typeof window !== 'undefined' ? (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})() : null;

const initialState = {
  isAuthenticated: Boolean(accessTokenFromStorage),
  user: userFromStorage,
  accessToken: accessTokenFromStorage,
  refreshToken: refreshTokenFromStorage,
};

export const fetchCurrentUser = createAsyncThunk(
  'authentication/fetchCurrentUser',
  async (_, { rejectWithValue, extra }) => {
    try {
      const { api } = await import('../../lib/apiClient.js');
      const { data } = await api.get('/auth/me');
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

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
      if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    setUser: (state, action) => {
      state.user = action.payload || null;
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('user');
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload || null;
        state.user = user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
      });
  }
});

export const { login, logout, setUser } = authenticationSlice.actions;

export default authenticationSlice.reducer;