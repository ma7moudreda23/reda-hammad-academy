"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-brand-900">{label}</span>
      <input
        type="text"
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-brand-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-brand-900">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-brand-200 bg-white px-4 py-2.5 leading-7 text-brand-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
      />
    </label>
  );
}

export function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-brand-100 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-extrabold text-brand-900">{title}</h2>
      {desc && <p className="mt-1 text-sm text-brand-900/55">{desc}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
