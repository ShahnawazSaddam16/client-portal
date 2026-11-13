'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const PURPOSES = [
  {
    value: 'Only Visit and Check Features',
    label: 'Only Visit and Check Features',
    desc: 'Just exploring and want to see what you offer.',
    icon: Eye,
  },
  {
    value: 'Become a Client',
    label: 'Become a Client',
    desc: 'Ready to start a project and work with you.',
    icon: UserCheck,
  },
  {
    value: 'Custom Project Requirements',
    label: 'Custom Project Requirements',
    desc: 'I have specific needs and want a tailored solution.',
    icon: Sparkles,
  },
];

const initialForm = { name: '', email: '', purpose: '', message: '' };

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-gray-500 text-sm font-medium">{label}</span>
      <div className="relative mt-1.5">
        <Icon size={18} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
        {children}
      </div>
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-100 bg-white pl-11 pr-4 py-3 text-sm text-gray-950 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10';

export default function QuotePopUp({ open, setOpen }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setForm(initialForm);
      setError('');
      setSuccess(false);
    }, 200);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.purpose || !form.message) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN}/client/quotes/sent-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to send quote');
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="quote-fade fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={close}
    >
      <style>{`
        @keyframes quoteFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes quoteRise {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .quote-fade { animation: quoteFade 0.25s ease-out forwards; }
        .quote-rise { animation: quoteRise 0.35s ease-out forwards; }
      `}</style>

      <div
        className="quote-rise relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-all duration-300 hover:bg-gray-100 hover:text-gray-950"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="flex flex-col items-center text-center px-6 py-12 sm:px-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
              <CheckCircle2 size={34} className="text-blue-600" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-gray-950">
              Quote <span className="text-blue-600">Sent</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Thanks for reaching out. We will get back to you shortly.
            </p>
            <button
              onClick={close}
              className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-8 sm:px-10">
            <div className="space-y-2 pr-8">
              <h2 className="text-[25px] sm:text-[30px] font-extrabold text-gray-950">
                Request a <span className="text-blue-600">Quote</span>
              </h2>
              <p className="text-sm text-gray-500 sm:text-base">
                Tell us about your project and we will reply with a tailored quote.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <Field icon={User} label="Full Name">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </Field>

              <Field icon={Mail} label="Email">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>

              <div>
                <span className="text-gray-500 text-sm font-medium">Purpose</span>
                <div className="mt-1.5 grid gap-3">
                  {PURPOSES.map(({ value, label, desc, icon: Icon }) => {
                    const active = form.purpose === value;

                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setForm((prev) => ({ ...prev, purpose: value }))}
                        className={`flex w-full items-center gap-4 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                          active
                            ? 'border-blue-600 ring-4 ring-blue-600/10'
                            : 'border-gray-100'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            active ? 'bg-blue-600 text-white' : 'bg-blue-600/10 text-blue-600'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-950">{label}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
                        </div>
                        {active && <CheckCircle2 size={20} className="shrink-0 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field icon={MessageSquare} label="Message">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your project..."
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-blue-600 shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={close}
                disabled={loading}
                className="rounded-xl border border-gray-100 bg-white px-6 py-3 text-sm font-medium text-gray-500 shadow-sm transition-all duration-300 hover:text-gray-950 hover:shadow-md disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Sending...' : 'Send Quote'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}