'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!API_ORIGIN) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_ORIGIN}/client/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data?.success && data?.user) {
        setUser(data.user);
        return data.user;
      }

      setUser(null);
      return null;
    } catch (error) {
      console.error('Auth refetch failed:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_ORIGIN]);

  const logout = useCallback(async () => {
    if (!API_ORIGIN) {
      setUser(null);
      return;
    }

    try {
      await fetch(`${API_ORIGIN}/client/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  }, [API_ORIGIN]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refetch,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, refetch, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
