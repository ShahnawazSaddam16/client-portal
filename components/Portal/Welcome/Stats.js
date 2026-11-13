'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';


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

function StatCard({ label, value, delay, suffix = '' }) {
  const count = useCountUp(value);

  return (
    <div
      className="stats-rise bg-white border border-gray-100 rounded-xl shadow-sm p-5 w-full sm:w-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h1 className="text-gray-500 text-sm font-medium">{label}</h1>
      <p className="text-blue-600 text-3xl font-bold mt-1">
        {count}
        {suffix}
      </p>
    </div>
  );
}

function Bar({ percent, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), delay + 100);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap justify-start items-start gap-5 mt-6 w-full">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[98px] w-full sm:w-[220px] animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/projects/user-project`, {
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

  const total = data?.totalProjects || 0;
  const ongoing = data?.totalOngoingProjects || 0;
  const completed = Math.max(total - ongoing, 0);
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const ongoingProjects = data?.ongoingProjects || [];

  const statusBreakdown = Object.entries(
    ongoingProjects.reduce((acc, project) => {
      const key = project.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  );

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
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-start items-start gap-5 mt-6 w-full">
            <StatCard label="Total Projects" value={total} delay={0} />
            <StatCard label="Projects Ongoing" value={ongoing} delay={120} />
            <StatCard label="Projects Completed" value={completed} delay={240} />
            <StatCard label="Completion Rate" value={rate} suffix="%" delay={360} />
          </div>

          {total > 0 && (
            <div
              className="stats-rise mt-5 w-full sm:max-w-[940px] bg-white border border-gray-100 rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: '440ms' }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-gray-500 text-sm font-medium">Overall Progress</h2>
                <span className="text-blue-600 text-sm font-bold">{rate}%</span>
              </div>
              <div className="mt-3">
                <Bar percent={rate} delay={440} />
              </div>
              <p className="mt-3 text-gray-500 text-xs sm:text-sm">
                {completed} of {total} {total === 1 ? 'project' : 'projects'} delivered
                {ongoing > 0 ? `, ${ongoing} in progress` : ''}
              </p>
            </div>
          )}

          {statusBreakdown.length > 0 && (
            <div
              className="stats-rise mt-5 w-full sm:max-w-[940px] bg-white border border-gray-100 rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: '520ms' }}
            >
              <h2 className="text-gray-500 text-sm font-medium">Status Breakdown</h2>
              <div className="mt-4 space-y-4">
                {statusBreakdown.map(([status, count], index) => {
                  const percent = Math.round((count / ongoingProjects.length) * 100);

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-950 text-sm font-medium">{status}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                          {count} {count === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Bar percent={percent} delay={560 + index * 100} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 w-full">
            <h2 className="stats-rise text-lg sm:text-xl font-bold text-gray-950" style={{ animationDelay: '600ms' }}>
              Active <span className="text-blue-600">Projects</span>
            </h2>

            {ongoingProjects.length === 0 ? (
              <p className="stats-rise mt-4 text-gray-500 text-sm" style={{ animationDelay: '660ms' }}>
                No active projects right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 w-full sm:max-w-2xl">
                {ongoingProjects.map((project, index) => {
                  const hasProgress = typeof project.progress === 'number';
                  const due = project.dueDate ? formatDate(project.dueDate) : '';

                  return (
                    <li
                      key={project._id}
                      className="stats-slide bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md"
                      style={{ animationDelay: `${660 + index * 80}ms` }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block truncate text-gray-950 text-sm sm:text-base font-medium">
                            {project.projectName || 'Untitled project'}
                          </span>
                          {due && (
                            <span className="block mt-0.5 text-gray-500 text-xs">Due {due}</span>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                          {project.status}
                        </span>
                      </div>

                      {hasProgress && (
                        <div className="mt-3 flex items-center gap-3">
                          <Bar
                            percent={Math.min(Math.max(project.progress, 0), 100)}
                            delay={660 + index * 80}
                          />
                          <span className="text-blue-600 text-xs font-bold">
                            {Math.min(Math.max(project.progress, 0), 100)}%
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}