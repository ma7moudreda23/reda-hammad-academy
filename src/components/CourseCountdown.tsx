"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number): Remaining | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "يوم" },
  { key: "hours", label: "ساعة" },
  { key: "minutes", label: "دقيقة" },
  { key: "seconds", label: "ثانية" },
];

export function CourseCountdown({ startAt }: { startAt: string }) {
  // Parse once; an empty/invalid value disables the whole widget.
  const target = startAt ? new Date(startAt).getTime() : NaN;
  const valid = Number.isFinite(target);

  // Start null so the server render and the first client render match (avoids a
  // hydration mismatch); the real value fills in after mount.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!valid) return;
    setMounted(true);
    setRemaining(diff(target));
    const id = setInterval(() => setRemaining(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target, valid]);

  if (!valid) return null;

  const startedLabel = (
    <div className="mt-4 flex items-center justify-center gap-2 rounded-card border border-brand-100 bg-brand-50 px-5 py-3 text-center">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500/50" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-600" />
      </span>
      <span className="text-base font-black text-brand-800">بدأت الدورة 🎉</span>
    </div>
  );

  // Before mount, or once the target has passed, show the "started" state.
  if (mounted && !remaining) return startedLabel;

  return (
    <div className="mt-4 rounded-card border border-brand-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-center text-sm font-bold text-brand-900/70">
        تبدأ الدورة خلال
      </p>
      <div className="grid grid-cols-4 gap-2" dir="ltr">
        {UNITS.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col items-center rounded-xl bg-gradient-to-b from-brand-800 to-brand-900 px-1 py-3 text-white"
          >
            <span className="text-2xl font-black tabular-nums sm:text-3xl">
              {remaining ? pad(remaining[key]) : "--"}
            </span>
            <span className="mt-1 text-[11px] font-bold text-accent-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
