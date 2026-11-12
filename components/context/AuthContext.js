'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  const trimmed = text.trim();
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return null;
    }
  }

  return null;
}

export function AuthProvider({ children }) {
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
      const res = await fetch(`/api/proxy/client/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await parseJsonResponse(res);

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
      const res = await fetch(`/api/proxy/client/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res && !res.ok) {
        const data = await parseJsonResponse(res);
        console.warn('Logout request returned a non-OK response:', data?.message || res.statusText);
      }
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
      setUser,
      loading,
      refetch,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, setUser, loading, refetch, logout]
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
