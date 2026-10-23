'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from '@/components/context/AuthContext';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

const statusStyles = {
  'In Progress': 'bg-blue-600 text-white',
  Completed: 'bg-blue-50 text-blue-600',
  Pending: 'bg-gray-100 text-blue-600',
  'Not Started': 'bg-gray-100 text-gray-600',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap ${
        statusStyles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status || 'Unknown'}
    </span>
  );
}

function Gallery({ images = [], name }) {
  if (!images.length) {
    return (
      <div className="flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
        <span className="text-sm">No images</span>
      </div>
    );
  }

  if (images.length === 1) {
    return <img src={images[0]} alt={name || 'Project image'} className="h-full w-full object-cover" />;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={0}
      slidesPerView={1}
      className="project-swiper"
      style={{ width: '100%', height: '100%' }}
    >
      {images.map((src, i) => (
        <SwiperSlide key={`${src}-${i}`}>
          <img
            src={src}
            alt={`${name || 'Project'} ${i + 1}`}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ProgressRing({ value }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#eff6ff" strokeWidth="12" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-950">{value}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-5 py-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-950">{value || '—'}</p>
    </div>
  );
}

function Loader() {
  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <div className="h-[340px] w-full animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-[220px] w-full animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function ProjectById() {
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id || params?.slug;
  const userId = user?._id || user?.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !id) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_ORIGIN}/client/projects/user-project/${id}`, {
          credentials: 'include',
          method: 'GET',
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load project');
        }

        setProject(json.project || null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId, id]);

  const { pct, steps } = useMemo(() => {
    const raw = project?.projectProgress;
    const items = (Array.isArray(raw) ? raw : [raw])
      .map((p) => String(p ?? '').trim())
      .filter(Boolean);

    const percentItems = items.filter((p) => /^\d{1,3}\s*%?$/.test(p));
    const textItems = items.filter((p) => !/^\d{1,3}\s*%?$/.test(p));

    return {
      pct: percentItems.length
        ? Math.min(parseInt(percentItems[percentItems.length - 1], 10), 100)
        : null,
      steps: textItems,
    };
  }, [project]);

  const links = Array.isArray(project?.projectLinks) ? project.projectLinks.filter(Boolean) : [];
  const images = Array.isArray(project?.projectImages) ? project.projectImages : [];

  return (
    <section className="flex w-full flex-col items-start justify-start">
      <style>{`
        @keyframes statsRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats-rise { opacity: 0; animation: statsRise 0.6s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .stats-rise { opacity: 1; animation: none; }
        }

        .project-swiper {
          --swiper-theme-color: #2563eb;
          --swiper-navigation-size: 18px;
        }
        .project-swiper .swiper-button-next,
        .project-swiper .swiper-button-prev {
          background: #fff;
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .project-swiper .swiper-button-next::after,
        .project-swiper .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 700;
        }
        .project-swiper .swiper-pagination-bullet { background: #fff; opacity: 0.8; }
        .project-swiper .swiper-pagination-bullet-active { background: #2563eb; opacity: 1; }
      `}</style>

      <Link
        href="/portal/projects"
        className="stats-rise inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500 transition-colors duration-300 hover:bg-blue-50 hover:text-blue-600"
      >
        <span aria-hidden="true">←</span>
        All Projects
      </Link>

      {loading && <Loader />}

      {!loading && error && (
        <div className="stats-rise mt-6 w-full rounded-2xl bg-white p-6 text-sm text-blue-600 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && !project && (
        <div className="stats-rise mt-6 w-full rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
          Project not found.
        </div>
      )}

      {!loading && !error && project && (
        <div className="mt-6 flex w-full flex-col gap-6">
          <div className="stats-rise flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-blue-600">
                {project.projectType || 'Project'}
              </p>
              <h1 className="text-[25px] font-extrabold leading-tight text-gray-950 sm:text-[36px]">
                {project.projectName || 'Untitled project'}
              </h1>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div
            className="stats-rise relative h-[260px] w-full overflow-hidden rounded-2xl bg-gray-50 shadow-sm sm:h-[360px] lg:h-[440px]"
            style={{ animationDelay: '80ms' }}
          >
            <Gallery images={images} name={project.projectName} />
          </div>

          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="stats-rise flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:col-span-2"
              style={{ animationDelay: '160ms' }}
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                  Project <span className="text-blue-600">Progress</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Track where things stand and what has been done so far.
                </p>
              </div>

              {pct !== null && (
                <div className="flex flex-col items-center gap-6 rounded-xl bg-gray-50 p-6 sm:flex-row">
                  <ProgressRing value={pct} />
                  <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Overall completion</span>
                      <span className="font-semibold text-blue-600">{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {steps.length > 0 && (
                <ol className="flex flex-col">
                  {steps.map((s, i) => (
                    <li key={`${s}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                      {i !== steps.length - 1 && (
                        <span className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-blue-100" />
                      )}
                      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                        {i + 1}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed text-gray-950">{s}</p>
                    </li>
                  ))}
                </ol>
              )}

              {pct === null && steps.length === 0 && (
                <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
                  No progress updates yet.
                </div>
              )}
            </div>

            <div
              className="stats-rise flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
              style={{ animationDelay: '240ms' }}
            >
              <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                Project <span className="text-blue-600">Details</span>
              </h2>

              <div className="flex flex-col gap-3">
                <Detail label="Type" value={project.projectType} />
                <Detail label="Duration" value={project.projectDuration} />
                <Detail label="Status" value={project.status} />
              </div>

              {links.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500">Links</p>
                  <div className="flex flex-wrap gap-2">
                    {links.map((link, i) => (
                      <a
                        key={`${link}-${i}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
                      >
                        Link {links.length > 1 ? i + 1 : ''} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}