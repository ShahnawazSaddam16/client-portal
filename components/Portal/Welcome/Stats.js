'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function StatCard({ label, value, delay }) {
  const count = useCountUp(value);

  return (
    <div
      className="stats-rise rounded-2xl bg-white p-6 shadow-lg shadow-blue-600/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600/70">{label}</p>
      <p className="mt-3 text-5xl font-bold text-blue-600">{count}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-blue-600/10" />
      ))}
    </div>
  );
}

export default function Stats() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_ORIGIN}/client/projects/user-project`, {
          credentials: 'include',
          method: "GET",
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load stats');
        }

        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  return (
    <div className="min-h-screen bg-white p-6 sm:p-10">
      <style>{`
        @keyframes statsRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statsSlide {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .stats-rise { opacity: 0; animation: statsRise 0.6s ease-out forwards; }
        .stats-slide { opacity: 0; animation: statsSlide 0.5s ease-out forwards; }
      `}</style>

      <div className="mx-auto max-w-4xl">
        <div className="stats-rise">
          <p className="text-sm font-medium text-blue-600/70">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold text-blue-600 sm:text-4xl">{user?.username}</h1>
        </div>

        <div className="mt-10">
          {loading && <Skeleton />}

          {!loading && error && (
            <div className="stats-rise rounded-2xl bg-blue-600/10 p-6 text-blue-600">{error}</div>
          )}

          {!loading && !error && data && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <StatCard label="Total Projects" value={data.totalProjects} delay={0} />
                <StatCard label="Ongoing Projects" value={data.totalOngoingProjects} delay={120} />
              </div>

              <div className="mt-12">
                <h2 className="stats-rise text-xl font-semibold text-blue-600" style={{ animationDelay: '240ms' }}>
                  Active Projects
                </h2>

                {data.ongoingProjects.length === 0 ? (
                  <p className="stats-rise mt-4 text-blue-600/60" style={{ animationDelay: '300ms' }}>
                    No active projects right now.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.ongoingProjects.map((project, index) => (
                      <li
                        key={project._id}
                        className="stats-slide flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-md shadow-blue-600/10 transition-all duration-300 hover:translate-x-1 hover:shadow-lg hover:shadow-blue-600/20"
                        style={{ animationDelay: `${300 + index * 80}ms` }}
                      >
                        <span className="font-medium text-blue-600">
                          {project.name || project.title || 'Untitled project'}
                        </span>
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                          {project.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}