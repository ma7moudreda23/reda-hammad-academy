"use client";

export function NewsTicker({ items }: { items: string[] }) {
  const clean = items.map((s) => s.trim()).filter(Boolean);
  if (clean.length === 0) return null;

  // Repeat the headlines enough to comfortably exceed the widest screen, so the
  // strip is always full (no empty gaps). Then duplicate that group so the
  // -50% translate loops seamlessly.
  const repeat = Math.max(2, Math.ceil(14 / clean.length));
  const group = Array.from({ length: repeat }, () => clean).flat();
  const run = [...group, ...group];
  // Slower, readable pace — scales with the group so it stays consistent.
  const duration = Math.max(50, group.length * 7);

  return (
    <div className="flex h-11 w-full items-stretch overflow-hidden bg-brand-900 text-white shadow-md" dir="rtl">
      <span className="z-10 flex shrink-0 items-center gap-2 bg-accent-500 px-4 text-sm font-black text-brand-900">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-900/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-900" />
        </span>
        أخبار
      </span>
      <div className="relative flex-1 overflow-hidden" dir="ltr">
        <div
          className="ticker-track h-full items-center whitespace-nowrap"
          style={{ animationDuration: `${duration}s` }}
        >
          {run.map((text, i) => (
            <span
              key={i}
              dir="rtl"
              className="mx-3.5 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
