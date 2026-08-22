"use client";

export function NewsTicker({ items }: { items: string[] }) {
  const clean = items.map((s) => s.trim()).filter(Boolean);
  if (clean.length === 0) return null;

  // Duplicate the run so the -50% translate loops seamlessly.
  const run = [...clean, ...clean];
  // Slower for longer content so it stays readable.
  const duration = Math.max(24, clean.join("").length * 0.45);

  return (
    <div className="w-full overflow-hidden bg-brand-900 text-white shadow-md" dir="rtl">
      <div className="mx-auto flex max-w-full items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-accent-500 px-4 py-2.5 text-sm font-black text-brand-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-900/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-900" />
          </span>
          أخبار
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="ticker-track whitespace-nowrap py-2.5"
            style={{ animationDuration: `${duration}s` }}
          >
            {run.map((text, i) => (
              <span
                key={i}
                className="mx-8 inline-flex items-center gap-2.5 text-sm font-semibold"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
