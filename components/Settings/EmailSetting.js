'use client';

import React, { useEffect, useState } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_ORIGIN}/client/settings/email-setting`;

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="email-spin"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    >
      <path d="M12 3a9 9 0 019 9" />
    </svg>
  );
}

export default function EmailSetting() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(API, {
          credentials: 'include',
          method: 'GET',
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load settings');
        }

        setEnabled(Boolean(json.emailtoggle));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2400);
    return () => clearTimeout(timer);
  }, [notice]);

  const toggle = async () => {
    if (saving || loading) return;

    const next = !enabled;

    try {
      setSaving(true);
      setError('');
      setNotice('');
      setEnabled(next);

      const res = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailtoggle: next }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update setting');
      }

      setNotice(json.message || (next ? 'Emails turned on' : 'Emails turned off'));
    } catch (err) {
      setEnabled(!next);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex w-full flex-col items-start justify-start">
      <style>{`
        @keyframes statsRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes emailNotice {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes emailPing {
          0% { transform: scale(1); opacity: 0.45; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes emailSpin {
          to { transform: rotate(360deg); }
        }
        .stats-rise { opacity: 0; animation: statsRise 0.6s ease-out forwards; }
        .email-notice { animation: emailNotice 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .email-ping { animation: emailPing 1.8s ease-out infinite; }
        .email-spin { animation: emailSpin 0.7s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .stats-rise { opacity: 1; animation: none; }
          .email-ping { animation: none; }
        }
      `}</style>

      <div className="stats-rise max-w-[320px] space-y-3 sm:max-w-2xl">
        <h1 className="w-full text-[25px] font-extrabold text-gray-950 sm:text-[36px]">
          Email <span className="text-blue-600">Settings</span>
        </h1>
        <p className="text-sm text-gray-500 sm:text-[17px]">
          Choose whether you want to receive emails about your projects.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 h-[140px] w-full max-w-2xl animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        <div
          className="stats-rise mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
          style={{ animationDelay: '120ms' }}
        >
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                {enabled && <span className="email-ping absolute inset-0 rounded-full bg-blue-600/30" />}
                <span
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
                    enabled ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <MailIcon />
                </span>
              </div>

              <div className="min-w-0 space-y-1">
                <h2 className="text-lg font-bold text-gray-950 sm:text-xl">
                  Email for project <span className="text-blue-600">updates status</span>
                </h2>
                <p className="text-sm leading-relaxed text-gray-500">
                  Get an email whenever the status or progress of one of your projects changes.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-500 ${
                  enabled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="Email for project updates status"
                onClick={toggle}
                disabled={saving}
                className={`relative h-8 w-14 shrink-0 rounded-full shadow-sm outline-none transition-all duration-500 focus-visible:ring-4 focus-visible:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-80 ${
                  enabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    enabled ? 'translate-x-6 text-blue-600' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {saving ? <Spinner /> : enabled ? <CheckIcon /> : null}
                </span>
              </button>
            </div>
          </div>

          <div
            className={`grid transition-all duration-500 ease-out ${
              error || notice ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 sm:px-8">
                {error ? (
                  <p key={error} className="email-notice text-xs font-medium text-blue-600">
                    {error}
                  </p>
                ) : (
                  <p key={notice} className="email-notice text-xs font-medium text-gray-500">
                    {notice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}