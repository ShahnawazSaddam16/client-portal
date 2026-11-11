'use client';

import React from 'react';
import { User, Mail, Phone, Send, Code2 } from 'lucide-react';

const DEVELOPER = {
  name: 'Shahnawaz Saddam Butt',
  role: 'Developer, Butt Networks',
  email: 'shahnawazsaddamb@gmail.com',
  phone: '03004907243',
};

function InfoRow({ icon: Icon, label, value, href, delay }) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-gray-500">{label}</span>
        <span className="block truncate text-sm font-semibold text-gray-950">{value}</span>
      </span>
    </>
  );

  const className =
    'contact-slide group flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md';

  if (href) {
    return (
      <a href={href} className={className} style={{ animationDelay: `${delay}ms` }}>
        {content}
      </a>
    );
  }

  return (
    <div className={className} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </div>
  );
}

export default function ContactContainer() {
  const handleSend = () => {
    const subject = encodeURIComponent('Client Portal Inquiry');
    window.location.href = `mailto:${DEVELOPER.email}?subject=${subject}`;
  };

  return (
    <div className="flex w-full justify-center lg:justify-end">
      <style>{`
        @keyframes contactRise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contactSlide {
          from { opacity: 0; transform: translateX(14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes contactFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes contactShine {
          from { transform: translateX(-120%) skewX(-20deg); }
          to { transform: translateX(260%) skewX(-20deg); }
        }
        .contact-rise { opacity: 0; animation: contactRise 0.6s ease-out forwards; }
        .contact-slide { opacity: 0; animation: contactSlide 0.5s ease-out forwards; }
        .contact-float { animation: contactFloat 3s ease-in-out infinite; }
        .contact-btn:hover .contact-shine { animation: contactShine 0.9s ease-out; }
        .contact-btn:hover .contact-send { transform: translate(3px, -3px) rotate(8deg); }
      `}</style>

      <div className="contact-rise w-full max-w-[340px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div className="flex items-center gap-3">
          <span className="contact-float flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Code2 size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-950">
              Contact <span className="text-blue-600">Developer</span>
            </h2>
            <p className="text-xs text-gray-500">{DEVELOPER.role}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <InfoRow icon={User} label="Name" value={DEVELOPER.name} delay={150} />
          <InfoRow
            icon={Mail}
            label="Email"
            value={DEVELOPER.email}
            href={`mailto:${DEVELOPER.email}`}
            delay={250}
          />
          <InfoRow
            icon={Phone}
            label="Contact"
            value={DEVELOPER.phone}
            href={`tel:${DEVELOPER.phone}`}
            delay={350}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          className="contact-btn relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
        >
          <span className="contact-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25" />
          <span>Send Message</span>
          <Send size={16} className="contact-send transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}