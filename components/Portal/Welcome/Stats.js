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
      className="stats-rise bg-white border border-gray-100 rounded-xl shadow-sm p-5 w-full sm:w-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h1 className="text-gray-500 text-sm font-medium">{label}</h1>
      <p className="text-blue-600 text-3xl font-bold mt-1">{count}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col sm:flex-row justify-start items-start gap-5 mt-6 w-full">
      {[0, 1].map((i) => (
        <div key={i} className="h-[98px] w-full sm:w-[220px] animate-pulse rounded-xl bg-gray-100" />
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
    <section className="flex flex-col items-start justify-start w-full">
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

      <div className="stats-rise max-w-[320px] sm:max-w-2xl space-y-3">
        <h1 className="w-full text-[25px] sm:text-[36px] font-extrabold text-gray-950">
          Welcome,{' '}
          <span className="text-blue-600">{user?.username || 'Guest'}</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-[17px]">
          Track your projects, progress, and updates from one place.
        </p>
      </div>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="stats-rise mt-6 w-full rounded-xl bg-white border border-gray-100 shadow-sm p-5 text-sm text-blue-600">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="flex flex-col sm:flex-row justify-start items-start gap-5 mt-6 w-full">
            <StatCard label="Total Projects" value={data.totalProjects} delay={0} />
            <StatCard label="Projects Ongoing" value={data.totalOngoingProjects} delay={120} />
          </div>

          <div className="mt-10 w-full">
            <h2 className="stats-rise text-lg sm:text-xl font-bold text-gray-950" style={{ animationDelay: '240ms' }}>
              Active <span className="text-blue-600">Projects</span>
            </h2>

            {data.ongoingProjects.length === 0 ? (
              <p className="stats-rise mt-4 text-gray-500 text-sm" style={{ animationDelay: '300ms' }}>
                No active projects right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 w-full sm:max-w-2xl">
                {data.ongoingProjects.map((project, index) => (
                  <li
                    key={project._id}
                    className="stats-slide flex items-center justify-between bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md"
                    style={{ animationDelay: `${300 + index * 80}ms` }}
                  >
                    <span className="text-gray-950 text-sm sm:text-base font-medium">
                      {project.projectName || 'Untitled project'}
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
    </section>
  );
}