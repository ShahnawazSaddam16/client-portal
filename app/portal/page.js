'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';

export default function PortalPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center">
          <p className="text-lg font-medium">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Client Portal</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Welcome back, {user.username || user.email || 'Client'}
        </h1>
        <p className="mt-3 text-slate-600">
          Your portal dashboard is ready to be built out.
        </p>
      </div>
    </main>
  );
}
