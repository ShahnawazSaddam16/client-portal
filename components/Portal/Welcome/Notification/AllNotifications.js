'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, Mail, Clock, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupNotifications(items) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };

  items.forEach((item) => {
    const time = item.createdAt ? new Date(item.createdAt) : null;
    if (time && time >= startOfToday) groups.Today.push(item);
    else if (time && time >= startOfYesterday) groups.Yesterday.push(item);
    else groups.Earlier.push(item);
  });

  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

function Skeleton() {
  return (
    <div className="mt-6 w-full sm:max-w-2xl space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[84px] w-full animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

function NotificationItem({ item, delay, onDelete }) {
  const isNew = item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000;

  return (
    <li
      className="stats-slide flex items-start gap-4 bg-white border border-gray-100 rounded-xl shadow-sm px-5 py-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Mail size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-gray-950 text-sm sm:text-base font-medium break-words">
          {item.message}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={13} />
          <span>{formatTime(item.createdAt)}</span>
        </div>
      </div>

      {isNew && (
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
          New
        </span>
      )}

      <button
        onClick={() => onDelete(item._id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white active:scale-95"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function AllNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_ORIGIN}/client/messages/user-notification`, {
          credentials: 'include',
          method: 'GET',
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load notifications');
        }

        const sorted = [...json.data].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setNotifications(sorted);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [userId]);

  const openDelete = (id) => {
    setDeleteError('');
    setDeleteId(id);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteId(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError('');

      const res = await fetch(`${API_ORIGIN}/client/messages/delete-notification/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete notification');
      }

      setNotifications((prev) => prev.filter((n) => n._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  let runningIndex = 0;

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
        @keyframes dcFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dcPop {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .stats-rise { opacity: 0; animation: statsRise 0.6s ease-out forwards; }
        .stats-slide { opacity: 0; animation: statsSlide 0.5s ease-out forwards; }
        .dc-fade { animation: dcFade 0.25s ease-out forwards; }
        .dc-pop { animation: dcPop 0.3s ease-out forwards; }
      `}</style>

      <div className="stats-rise flex w-full sm:max-w-2xl items-start justify-between gap-4">
        <div className="max-w-[240px] sm:max-w-md space-y-3">
          <h1 className="w-full text-[25px] sm:text-[36px] font-extrabold text-gray-950">
            <span className="text-blue-600">Notifications</span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-[17px]">
            Stay on top of messages and updates from your team.
          </p>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-2.5">
            <Bell size={18} className="text-blue-600" />
            <span className="text-blue-600 text-xl font-bold">{notifications.length}</span>
          </div>
        )}
      </div>

      {loading && <Skeleton />}

      {!loading && error && (
        <div className="stats-rise mt-6 flex w-full sm:max-w-2xl items-center gap-3 rounded-xl bg-white border border-gray-100 shadow-sm p-5 text-sm text-blue-600">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div
          className="stats-rise mt-6 flex w-full sm:max-w-2xl flex-col items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm px-5 py-14 text-center"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <BellOff size={24} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-950">
            You're all <span className="text-blue-600">caught up</span>
          </h2>
          <p className="mt-1 text-gray-500 text-sm">No notifications right now.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="mt-8 w-full sm:max-w-2xl space-y-8">
          {grouped.map(([label, list]) => (
            <div key={label}>
              <h2
                className="stats-rise text-lg sm:text-xl font-bold text-gray-950"
                style={{ animationDelay: `${runningIndex * 80 + 120}ms` }}
              >
                {label}
              </h2>
              <ul className="mt-4 space-y-3 w-full">
                {list.map((item) => {
                  const delay = 180 + runningIndex * 80;
                  runningIndex += 1;
                  return <NotificationItem key={item._id} item={item} delay={delay} onDelete={openDelete} />;
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {deleteId !== null && (
        <div
          onClick={closeDelete}
          className="dc-fade fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dc-pop w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-blue-600/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">Delete notification?</h3>
            <p className="mt-1 text-sm text-gray-600">
              This notification will be permanently removed. This action cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">{deleteError}</p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/30 transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}