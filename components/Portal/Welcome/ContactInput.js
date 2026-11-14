'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';

const LIMIT = 1999;
const UPDATE_ID = 'v1';
const STORAGE_KEY = `update-answered-${UPDATE_ID}`;

export default function ContactInput({ open, setOpen }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [liked, setLiked] = useState(false);
  const [closing, setClosing] = useState(false);
  const [answered, setAnswered] = useState(true);

  useEffect(() => {
    try {
      setAnswered(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setAnswered(true);
    }
  }, []);

  const close = useCallback(() => {
    if (sending) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setMessage('');
      setError('');
      setSent(false);
      setLiked(false);
    }, 220);
  }, [sending, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(close, 1800);
    return () => clearTimeout(timer);
  }, [sent, close]);

  const answer = async (approval) => {
    try {
      setSending(true);
      setError('');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/messages/update-approval`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval, updateId: UPDATE_ID }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save your answer');
      }

      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {}

      setAnswered(true);

      if (approval === 'liked') {
        setLiked(true);
        setSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const submit = async () => {
    const text = message.trim();

    if (!text) {
      setError('Please write a message');
      return;
    }

    try {
      setSending(true);
      setError('');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/messages/sent-message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to send message');
      }

      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && !answered && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          New update
        </button>
      )}

      {open && (
        <section
          onClick={close}
          className={`fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 ${
            closing ? 'msg-fade-out' : 'msg-fade-in'
          }`}
        >
          <style>{`
            @keyframes msgFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes msgFadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
            }
            @keyframes msgPopIn {
              from { opacity: 0; transform: translateY(20px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes msgPopOut {
              from { opacity: 1; transform: translateY(0) scale(1); }
              to { opacity: 0; transform: translateY(12px) scale(0.97); }
            }
            @keyframes msgCheck {
              from { stroke-dashoffset: 30; }
              to { stroke-dashoffset: 0; }
            }
            @keyframes msgRing {
              from { opacity: 0; transform: scale(0.6); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes msgSpin {
              to { transform: rotate(360deg); }
            }
            .msg-fade-in { animation: msgFadeIn 0.25s ease-out forwards; }
            .msg-fade-out { animation: msgFadeOut 0.22s ease-in forwards; }
            .msg-pop-in { animation: msgPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .msg-pop-out { animation: msgPopOut 0.22s ease-in forwards; }
            .msg-check { stroke-dasharray: 30; stroke-dashoffset: 30; animation: msgCheck 0.5s ease-out 0.25s forwards; }
            .msg-ring { animation: msgRing 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .msg-spin { animation: msgSpin 0.7s linear infinite; }
          `}</style>

          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md bg-white border border-gray-100 rounded-xl shadow-xl p-6 sm:p-7 ${
              closing ? 'msg-pop-out' : 'msg-pop-in'
            }`}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all duration-300 hover:bg-gray-100 hover:text-gray-950 hover:rotate-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {sent ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="msg-ring flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path className="msg-check" d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-gray-950">
                  {liked ? (
                    <>
                      Thank <span className="text-blue-600">You</span>
                    </>
                  ) : (
                    <>
                      Message <span className="text-blue-600">Sent</span>
                    </>
                  )}
                </h2>
                <p className="mt-1 text-gray-500 text-sm">
                  {liked ? 'Glad you like the update.' : 'We will get back to you soon.'}
                </p>
              </div>
            ) : !answered ? (
              <>
                <div className="space-y-1 pr-8">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                    Do you like the <span className="text-blue-600">Update</span>?
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Hi {user?.username || 'there'}, let us know what you think of the latest update.
                  </p>
                </div>

                <div className="mt-5 min-h-[1rem] text-xs">
                  <span className={`text-blue-600 transition-all duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>
                    {error || ' '}
                  </span>
                </div>

                <div className="mt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => answer('disliked')}
                    disabled={sending}
                    className="rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-950 hover:shadow-md disabled:opacity-60"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => answer('liked')}
                    disabled={sending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {sending && (
                      <svg className="msg-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M12 3a9 9 0 019 9" />
                      </svg>
                    )}
                    Yes
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1 pr-8">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                    Send a <span className="text-blue-600">Message</span>
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Hi {user?.username || 'there'}, tell us what you need and we will reply to your email.
                  </p>
                </div>

                <div className="mt-5">
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value.slice(0, LIMIT));
                      if (error) setError('');
                    }}
                    rows={6}
                    placeholder="Write your message..."
                    className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-950 placeholder-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-blue-600 focus:shadow-md focus:ring-4 focus:ring-blue-600/10"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={`text-blue-600 transition-all duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>
                      {error || ' '}
                    </span>
                    <span className="text-gray-500">
                      {message.length}/{LIMIT}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={sending}
                    className="rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-gray-950 hover:shadow-md disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {sending && (
                      <svg className="msg-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M12 3a9 9 0 019 9" />
                      </svg>
                    )}
                    {sending ? 'Sending' : 'Send Message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}