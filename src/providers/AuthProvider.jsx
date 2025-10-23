import React, { createContext, useCallback, useContext, useMemo } from 'react';
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

const hasAccessToken = () =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('accessToken'));

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const hasToken = hasAccessToken();
  const initialUser = readStoredUser();

  // Always validate if we have token, but use cached data immediately
  const { 
    data: user = initialUser,
    isLoading,
    isFetching 
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/admin/me');
      return data;
    },
    enabled: hasToken, // Always validate if token exists
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(({ user: nextUser, accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (nextUser) {
      queryClient.setQueryData(['auth', 'me'], nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    queryClient.setQueryData(['auth', 'me'], null);
  }, [queryClient]);

  const isAuthenticated = Boolean(user) && hasToken;
  
  // Only show loading if we have NO user data and query is running
  const isLoadingUser = !user && (isLoading || isFetching);

  console.log('Auth State:', {
    hasToken,
    user: !!user,
    initialUser: !!initialUser,
    isLoading,
    isFetching,
    isAuthenticated,
    isLoadingUser
  });

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoadingUser,
    login,
    logout,
  }), [user, isAuthenticated, isLoadingUser, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthProvider;