"use client";

import { useEffect, useState } from "react";
import type { PromoStatus } from "@/lib/promo";

export function usePromo(slug: string, enabled: boolean) {
  const [status, setStatus] = useState<PromoStatus | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(`/api/promo/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);

  return status;
}

export function PromoCounter({ status, compact = false }: { status: PromoStatus; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  if (status.ended) {
    return (
      <p className={compact ? "text-xs font-bold text-brand-900/55" : "mt-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-900/60"}>
        انتهت مقاعد الخصم
      </p>
    );
  }

  if (compact) {
    return (
      <p className="text-xs font-bold text-brand-700">
        متبقي {status.remaining} من {status.total} بالخصم ·{" "}
        <span dir="ltr" className="font-black">{status.code}</span>
      </p>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(status.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the code stays visible to type by hand */
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-accent-300 bg-accent-500/15 p-4">
      <p className="font-black text-brand-800">
        متبقي <span className="text-2xl">{status.remaining}</span> من {status.total} مقعدًا بالخصم
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-accent-500" style={{ width: `${(status.remaining / status.total) * 100}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-brand-900/70">
        <span>اكتب الكود في صفحة الدفع عشان تاخد الخصم:</span>
        <span dir="ltr" className="rounded-lg border border-brand-200 bg-white px-2.5 py-1 font-black text-brand-800">
          {status.code}
        </span>
        <button type="button" onClick={copy}
          className="cursor-pointer rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-brand-700">
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
    </div>
  );
}
