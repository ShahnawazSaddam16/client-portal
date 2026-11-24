'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const healthStyles = {
  'On Track': 'bg-green-100 text-green-600',
  'At Risk': 'bg-yellow-100 text-yellow-600',
  Delayed: 'bg-red-100 text-red-600',
  Completed: 'bg-green-100 text-green-600',
  'Not Started': 'bg-gray-100 text-gray-600',
};

function SparkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-blue-600">{title}</p>
      {children}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex gap-3 text-sm leading-relaxed text-gray-950">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-24 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-gray-100" />
      <div className="h-24 w-full animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

export default function AiSuggestModal({ open, onClose, projectId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [open, onClose]);

  const generate = async () => {
    if (!projectId || loading) return;

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError('');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/client/projects/ai-suggest/${projectId}`,
        {
          method: 'POST',
          credentials: 'include',
          signal: controller.signal,
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to get AI suggestions');
      }

      setSuggestion(json.suggestion || null);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  if (!open) return null;

  const nextSteps = Array.isArray(suggestion?.nextSteps) ? suggestion.nextSteps : [];
  const risks = Array.isArray(suggestion?.risks) ? suggestion.risks : [];
  const ideas = Array.isArray(suggestion?.progressUpdateIdeas) ? suggestion.progressUpdateIdeas : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-bold text-gray-950 sm:text-lg">
              AI <span className="text-blue-600">Suggest</span>
            </h3>
            <p className="text-sm text-gray-500">Smart recommendations based on your project data.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-blue-600 px-4 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
          >
            Close ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {!suggestion && !loading && (
            <div className="flex flex-col items-center gap-4 rounded-xl bg-blue-50 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <SparkIcon />
              </span>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-950">
                  Get your project <span className="text-blue-600">Recommendations</span>
                </h4>
                <p className="text-sm text-gray-500">
                  {error || 'Tap the button to analyze progress, deadline and risks.'}
                </p>
              </div>
              <button
                type="button"
                onClick={generate}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
              >
                <SparkIcon />
                AI Suggest
              </button>
            </div>
          )}

          {loading && <ResultSkeleton />}

          {suggestion && !loading && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap ${
                    healthStyles[suggestion.health] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {suggestion.health || 'Unknown'}
                </span>
                {suggestion.suggestedStatus && (
                  <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium whitespace-nowrap text-blue-600">
                    Suggested: {suggestion.suggestedStatus}
                  </span>
                )}
              </div>

              {suggestion.summary && (
                <Section title="Summary">
                  <p className="text-sm leading-relaxed text-gray-950">{suggestion.summary}</p>
                </Section>
              )}

              {nextSteps.length > 0 && (
                <Section title="Next Steps">
                  <BulletList items={nextSteps} />
                </Section>
              )}

              {risks.length > 0 && (
                <Section title="Risks">
                  <BulletList items={risks} />
                </Section>
              )}

              {ideas.length > 0 && (
                <Section title="Progress Update Ideas">
                  <BulletList items={ideas} />
                </Section>
              )}

              {suggestion.timelineAdvice && (
                <Section title="Timeline Advice">
                  <p className="text-sm leading-relaxed text-gray-950">{suggestion.timelineAdvice}</p>
                </Section>
              )}

              {error && <p className="text-sm text-blue-600">{error}</p>}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-600 px-5 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  <SparkIcon />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}