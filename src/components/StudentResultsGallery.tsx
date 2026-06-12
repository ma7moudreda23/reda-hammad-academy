"use client";

import { Reveal } from "@/components/motion";
import { AcademicIcon } from "@/components/icons";

function isVideoFile(url: string) {
  return /\.(mp4|webm|mov|m4v)$/i.test(url);
}

export type ResultItem = { mediaUrl: string; caption: string };

export function StudentResultsGallery({ items }: { items: ResultItem[] }) {
  const valid = items.filter((i) => i.mediaUrl);

  if (valid.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-brand-200 bg-white p-16 text-center">
        <AcademicIcon className="mx-auto h-14 w-14 text-brand-300" />
        <p className="mt-4 text-lg font-bold text-brand-900">
          سيتم عرض إنجازات الطلاب هنا قريبًا
        </p>
        <p className="mt-2 text-brand-900/60">
          تابعنا لمشاهدة نتائج وتفوّق طلابنا.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {valid.map((item, i) => (
        <Reveal
          key={i}
          className="break-inside-avoid overflow-hidden rounded-card border border-brand-100 bg-white shadow-sm"
        >
          {isVideoFile(item.mediaUrl) ? (
            <video
              src={item.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.mediaUrl}
              alt={item.caption || "نتيجة طالب"}
              loading="lazy"
              decoding="async"
              className="w-full"
            />
          )}
          {item.caption && (
            <p className="px-4 py-3 text-center font-bold text-brand-900">
              {item.caption}
            </p>
          )}
        </Reveal>
      ))}
    </div>
  );
}
