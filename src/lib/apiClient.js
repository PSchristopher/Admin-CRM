import axios from 'axios';
import { store } from '../store/store';
import { login as setAuth, logout as clearAuth } from '../store/slices/authenticationSlice.jsx';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error);
      return;
    }
    if (token) {
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
    }
    resolve(axios(originalRequest));
  });
  pendingRequests = [];
};

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const accessToken = state?.authentication?.accessToken || localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const refreshToken = store.getState()?.authentication?.refreshToken || localStorage.getItem('refreshToken');
      if (!refreshToken) {
        store.dispatch(clearAuth());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken || refreshToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          store.dispatch(setAuth({ user: store.getState()?.authentication?.user, accessToken: newAccessToken, refreshToken: newRefreshToken }));

          processQueue(null, newAccessToken);
          isRefreshing = false;

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
        throw new Error('No access token in refresh response');
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(clearAuth());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

