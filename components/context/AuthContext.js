'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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

function SessionLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-white">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
      </div>
      <p className="animate-pulse text-sm font-medium text-gray-500">
        Checking your <span className="text-blue-600">session</span>
      </p>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const initializedRef = useRef(false);
  const inFlightRef = useRef(null);

  const refetch = useCallback(() => {
    if (inFlightRef.current) return inFlightRef.current;

    const run = async () => {
      try {
        if (!initializedRef.current) setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/auth/me`, {
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
        initializedRef.current = true;
        setLoading(false);
        setInitialized(true);
      }
    };

    inFlightRef.current = run().finally(() => {
      inFlightRef.current = null;
    });

    return inFlightRef.current;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setLoading(false);

    fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await parseJsonResponse(res);
          console.warn('Logout request returned a non-OK response:', data?.message || res.statusText);
        }
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  }, []);

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

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : <SessionLoader />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}