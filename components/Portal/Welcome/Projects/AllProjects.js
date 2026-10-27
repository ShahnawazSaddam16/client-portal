'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useAuth } from '@/components/context/AuthContext';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

const BASE_FILTERS = ['All', 'Not Started', 'Pending', 'In Progress', 'Completed'];

const statusStyles = {
  'In Progress': 'bg-blue-600 text-white',
  Completed: 'bg-blue-50 text-blue-600 border border-blue-600',
  Pending: 'bg-white text-blue-600 border border-blue-600',
  'Not Started': 'bg-gray-100 text-gray-600',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
        statusStyles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status || 'Unknown'}
    </span>
  );
}

function ImageViewer({ images, startIndex, name, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex h-full max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-bold text-gray-950 sm:text-lg">
            {name || 'Project images'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-blue-600 px-4 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
          >
            Close ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-gray-50">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={startIndex}
            spaceBetween={0}
            slidesPerView={1}
            className="project-swiper viewer-swiper"
            style={{ width: '100%', height: '100%' }}
          >
            {images.map((src, i) => (
              <SwiperSlide key={`${src}-${i}`}>
                <div className="flex h-full w-full items-center justify-center px-4 pb-10 pt-4">
                  <img
                    src={src}
                    alt={`${name || 'Project'} ${i + 1}`}
                    className="max-h-full max-w-full rounded-lg object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProjectImages({ images = [], name, onOpen }) {
  if (!images.length) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
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
    return (
      <img
        src={images[0]}
        alt={name || 'Project image'}
        className="absolute inset-0 h-full w-full cursor-zoom-in object-contain"
        loading="lazy"
        onClick={() => onOpen(0)}
      />
    );
  }

  return (
    <div className="absolute inset-0">
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
              className="h-full w-full cursor-zoom-in object-contain"
              referrerPolicy="no-referrer"
              onClick={() => onOpen(i)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function ProgressBlock({ progress }) {
  const items = (Array.isArray(progress) ? progress : [progress])
    .map((p) => String(p ?? '').trim())
    .filter(Boolean);

  if (!items.length) return null;

  const percentItems = items.filter((p) => /^\d{1,3}\s*%?$/.test(p));
  const textItems = items.filter((p) => !/^\d{1,3}\s*%?$/.test(p));
  const pct = percentItems.length
    ? Math.min(parseInt(percentItems[percentItems.length - 1], 10), 100)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {pct !== null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-semibold text-blue-600">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {textItems.length > 0 && (
        <div>
          {pct === null && <p className="mb-1.5 text-xs text-gray-500">Progress</p>}
          <ul className="flex flex-col gap-1.5">
            {textItems.map((t, i) => (
              <li key={`${t}-${i}`} className="flex items-start gap-2 text-sm leading-relaxed text-gray-950">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span className="line-clamp-3">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 pr-6 [&:not(:first-child)]:pl-6 [&:not(:last-child)]:border-r [&:not(:last-child)]:border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-sm font-semibold text-gray-950">{value || '—'}</p>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const [viewerIndex, setViewerIndex] = useState(null);
  const links = Array.isArray(project.projectLinks) ? project.projectLinks.filter(Boolean) : [];
  const images = Array.isArray(project.projectImages) ? project.projectImages : [];

  return (
    <article
      className="stats-rise flex w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md md:flex-row"
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      <div className="relative h-56 w-full shrink-0 bg-gray-50 md:h-auto md:min-h-[280px] md:w-[300px] lg:w-[380px]">
        <ProjectImages images={images} name={project.projectName} onOpen={setViewerIndex} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 text-lg font-bold leading-tight text-gray-950 sm:text-xl">
            {project.projectName || 'Untitled project'}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <div className="flex flex-wrap gap-y-3 rounded-lg bg-gray-50 px-4 py-3">
          <MetaItem label="Type" value={project.projectType} />
          <MetaItem label="Duration" value={project.projectDuration} />
        </div>

        <ProgressBlock progress={project.projectProgress} />

        <div>
          <Link
            href={`/portal/projects/${project._id}`}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
          >
            View Progress
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {links.length > 0 && (
          <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">Links</p>
            <div className="flex flex-wrap gap-2">
              {links.map((link, i) => (
                <a
                  key={`${link}-${i}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-blue-600 px-4 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Link {links.length > 1 ? i + 1 : ''} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewerIndex !== null && images.length > 0 && (
        <ImageViewer
          images={images}
          startIndex={viewerIndex}
          name={project.projectName}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </article>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[300px] w-full animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

export default function AllProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

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
          method: 'GET',
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load projects');
        }

        setProjects(json.userproject || []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  const filters = useMemo(() => {
    const extra = [...new Set(projects.map((p) => p.status).filter(Boolean))].filter(
      (s) => !BASE_FILTERS.includes(s)
    );
    return [...BASE_FILTERS, ...extra];
  }, [projects]);

  const counts = useMemo(() => {
    const map = { All: projects.length };
    projects.forEach((p) => {
      map[p.status] = (map[p.status] || 0) + 1;
    });
    return map;
  }, [projects]);

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

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
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .project-swiper .swiper-button-next::after,
        .project-swiper .swiper-button-prev::after {
          font-size: 13px;
          font-weight: 700;
        }
        .project-swiper .swiper-pagination-bullet { background: #fff; opacity: 0.8; }
        .project-swiper .swiper-pagination-bullet-active { background: #2563eb; opacity: 1; }
        .viewer-swiper .swiper-pagination-bullet { background: #9ca3af; opacity: 0.8; }
        .viewer-swiper .swiper-pagination-bullet-active { background: #2563eb; opacity: 1; }
      `}</style>

      <div className="stats-rise max-w-[320px] space-y-3 sm:max-w-2xl">
        <h1 className="w-full text-[25px] font-extrabold text-gray-950 sm:text-[36px]">
          All <span className="text-blue-600">Projects</span>
        </h1>
        <p className="text-sm text-gray-500 sm:text-[17px]">
          Browse every project and filter by its current status.
        </p>
      </div>

      {!loading && !error && (
        <div
          className="stats-rise mt-6 flex w-full gap-2 overflow-x-auto pb-1"
          style={{ animationDelay: '120ms' }}
        >
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                {f}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {counts[f] || 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="stats-rise mt-6 w-full rounded-xl border border-gray-100 bg-white p-5 text-sm text-blue-600 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {visible.length === 0 ? (
            <div className="stats-rise mt-6 w-full rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              {filter === 'All' ? 'No projects yet.' : `No "${filter}" projects right now.`}
            </div>
          ) : (
            <div className="mt-6 flex w-full flex-col gap-5">
              {visible.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}