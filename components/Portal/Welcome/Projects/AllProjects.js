'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

function ProjectImages({ images = [], name }) {
  if (!images.length) {
    return (
      <div className="h-48 w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        No images
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={name || 'Project image'}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={0}
      slidesPerView={1}
      className="h-48 w-full project-swiper"
    >
      {images.map((src, i) => (
        <SwiperSlide key={`${src}-${i}`}>
          <img
            src={src}
            alt={`${name || 'Project'} ${i + 1}`}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ProgressBlock({ progress }) {
  if (!progress) return null;

  const match = String(progress).trim().match(/^(\d{1,3})\s*%?$/);

  if (match) {
    const pct = Math.min(Number(match[1]), 100);
    return (
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span className="text-blue-600 font-semibold">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">Progress</p>
      <p className="text-sm text-gray-950 leading-relaxed">{progress}</p>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const links = Array.isArray(project.projectLinks) ? project.projectLinks.filter(Boolean) : [];

  return (
    <article
      className="stats-rise bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      <ProjectImages images={project.projectImages} name={project.projectName} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-gray-950 text-base sm:text-lg font-bold leading-tight">
            {project.projectName || 'Untitled project'}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-medium text-gray-950">{project.projectType || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-gray-950">{project.projectDuration || '—'}</p>
          </div>
        </div>

        <ProgressBlock progress={project.projectProgress} />

        {links.length > 0 && (
          <div className="mt-auto pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Links</p>
            <div className="flex flex-wrap gap-2">
              {links.map((link, i) => (
                <a
                  key={`${link}-${i}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-blue-600 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Link {links.length > 1 ? i + 1 : ''} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6 w-full">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[380px] animate-pulse rounded-xl bg-gray-100" />
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

  // Base filters + any extra statuses that exist in the data
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
    <section className="flex flex-col items-start justify-start w-full">
      <style>{`
        @keyframes statsRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats-rise { opacity: 0; animation: statsRise 0.6s ease-out forwards; }

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
      `}</style>

      {/* Header */}
      <div className="stats-rise max-w-[320px] sm:max-w-2xl space-y-3">
        <h1 className="w-full text-[25px] sm:text-[36px] font-extrabold text-gray-950">
          All <span className="text-blue-600">Projects</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-[17px]">
          Browse every project and filter by its current status.
        </p>
      </div>

      {/* Filters */}
      {!loading && !error && (
        <div className="stats-rise mt-6 w-full flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: '120ms' }}>
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-blue-600 hover:text-blue-600'
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
        <div className="stats-rise mt-6 w-full rounded-xl bg-white border border-gray-100 shadow-sm p-5 text-sm text-blue-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {visible.length === 0 ? (
            <div className="stats-rise mt-6 w-full rounded-xl bg-white border border-gray-100 shadow-sm p-8 text-center text-gray-500 text-sm">
              {filter === 'All' ? 'No projects yet.' : `No "${filter}" projects right now.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6 w-full">
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