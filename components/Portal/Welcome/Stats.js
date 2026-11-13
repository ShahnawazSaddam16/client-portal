'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/context/AuthContext';

// TODO: change this to your real notifications route
const NOTIFICATIONS_PATH = '/client/notifications/user-notification';

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

function StatCard({ label, value, delay, action }) {
  const count = useCountUp(value);

  return (
    <div
      className="stats-rise h-[136px] bg-white border border-gray-100 rounded-xl shadow-sm p-5 w-full sm:w-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h1 className="text-gray-500 text-sm font-medium">{label}</h1>
      <p className="text-blue-600 text-3xl font-bold mt-1">{count}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 mt-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:gap-2"
        >
          {action.label}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-start items-start gap-5 mt-6 w-full">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[136px] w-full sm:w-[220px] animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

export default function Stats() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const origin = process.env.NEXT_PUBLIC_API_ORIGIN;

    const loadProjects = async () => {
      const res = await fetch(`${origin}/client/projects/user-project`, {
        credentials: 'include',
        method: 'GET',
        signal: controller.signal,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to load stats');
      }
      return json;
    };

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${origin}${NOTIFICATIONS_PATH}`, {
          credentials: 'include',
          method: 'GET',
          signal: controller.signal,
        });
        const json = await res.json();

        if (!res.ok || !json.success) return 0;

        // uses totalNotifications if the API sends it, otherwise counts the array
        return json.totalNotifications ?? json.data?.length ?? 0;
      } catch (err) {
        return 0;
      }
    };

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [projects, notifCount] = await Promise.all([
          loadProjects(),
          loadNotifications(),
        ]);

        setData(projects);
        setTotalNotifications(notifCount);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
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
          <div className="flex flex-col sm:flex-row flex-wrap justify-start items-start gap-5 mt-6 w-full">
            <StatCard
              label="Total Projects"
              value={data.totalProjects}
              delay={0}
              action={{ label: 'Visit Projects', href: '/portal/projects' }}
            />
            <StatCard label="Projects Ongoing" value={data.totalOngoingProjects} delay={120} />
            <StatCard label="Total Notifications" value={totalNotifications} delay={240} />
          </div>

          <div className="mt-10 w-full">
            <h2 className="stats-rise text-lg sm:text-xl font-bold text-gray-950" style={{ animationDelay: '360ms' }}>
              Active <span className="text-blue-600">Projects</span>
            </h2>

            {data.ongoingProjects.length === 0 ? (
              <p className="stats-rise mt-4 text-gray-500 text-sm" style={{ animationDelay: '420ms' }}>
                No active projects right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 w-full sm:max-w-2xl">
                {data.ongoingProjects.map((project, index) => (
                  <li
                    key={project._id}
                    className="stats-slide flex items-center justify-between bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md"
                    style={{ animationDelay: `${420 + index * 80}ms` }}
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