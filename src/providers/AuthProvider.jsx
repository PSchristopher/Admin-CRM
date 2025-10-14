import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient.js';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasAccessToken = () => typeof window !== 'undefined' && Boolean(localStorage.getItem('accessToken'));

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readStoredUser());

  const { isFetching } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    enabled: hasAccessToken() && !user,
    retry: 1,
    onSuccess: (data) => {
      setUser(data || null);
      if (data) {
        localStorage.setItem('user', JSON.stringify(data));
      }
    },
    onError: () => {
      // Keep tokens; user may still be null until next successful fetch
    },
  });

  const login = useCallback(({ user: nextUser, accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser || null);
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user) || hasAccessToken(),
    isLoadingUser: isFetching,
    login,
    logout,
  }), [user, isFetching, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;


