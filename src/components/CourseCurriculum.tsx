"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CourseSection, CourseItemType } from "@/lib/curriculum";
import {
  PlayIcon,
  FileIcon,
  ExamIcon,
  ChevronIcon,
  CloseIcon,
} from "@/components/icons";

const TYPE_META: Record<CourseItemType, { label: string; Icon: typeof PlayIcon }> = {
  video: { label: "فيديو", Icon: PlayIcon },
  file: { label: "ملف", Icon: FileIcon },
  exam: { label: "اختبار", Icon: ExamIcon },
};

/** Turn any pasted video URL into an embeddable form. */
function getEmbed(url: string): { kind: "iframe" | "file"; src: string } {
  const u = url.trim();
  const yt = u.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u)) return { kind: "file", src: u };
  return { kind: "iframe", src: u };
}

export function CourseCurriculum({ sections }: { sections: CourseSection[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);

  if (sections.length === 0) return null;

  const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="mt-14">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-brand-900">محتوى الكورس</h2>
        <span className="text-sm font-semibold text-brand-900/55">
          {sections.length} أقسام · {totalItems} عنصر
        </span>
      </div>

      <div className="space-y-3">
        {sections.map((section, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-card border border-brand-100 bg-white"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-right transition-colors hover:bg-brand-50/60"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
                    {i + 1}
                  </span>
                  <span className="font-extrabold text-brand-900">{section.title}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-brand-900/45">
                    {section.items.length} عنصر
                  </span>
                  <ChevronIcon
                    className={`h-5 w-5 text-brand-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ul className="divide-y divide-brand-50 border-t border-brand-100">
                      {section.items.map((item, j) => {
                        const meta = TYPE_META[item.type] ?? TYPE_META.video;
                        const Icon = meta.Icon;
                        const playable = item.type === "video" && !!item.url;
                        const inner = (
                          <>
                            <span className="flex items-center gap-3">
                              <span
                                className={`grid h-9 w-9 place-items-center rounded-lg ${
                                  playable
                                    ? "bg-accent-500 text-white"
                                    : "bg-brand-50 text-brand-600"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="font-semibold text-brand-900/80">
                                {item.title}
                              </span>
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                playable
                                  ? "bg-accent-50 text-accent-600"
                                  : "bg-brand-50 text-brand-600"
                              }`}
                            >
                              {playable ? "معاينة ▸" : meta.label}
                            </span>
                          </>
                        );
                        return (
                          <li key={j}>
                            {playable ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreview({ title: item.title, url: item.url! })
                                }
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3 text-right transition-colors hover:bg-accent-50/50"
                              >
                                {inner}
                              </button>
                            ) : (
                              <div className="flex items-center justify-between gap-3 px-5 py-3">
                                {inner}
                              </div>
                            )}
                          </li>
                        );
                      })}
                      {section.items.length === 0 && (
                        <li className="px-5 py-3 text-sm text-brand-900/45">
                          لا توجد عناصر في هذا القسم بعد.
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-brand-900/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl overflow-hidden rounded-[1.25rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-5 py-3">
                <span className="flex items-center gap-2 font-extrabold text-brand-900">
                  <PlayIcon className="h-5 w-5 text-accent-500" />
                  {preview.title || "معاينة"}
                </span>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-brand-100 text-brand-600 hover:bg-brand-50"
                  aria-label="إغلاق"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                {(() => {
                  const embed = getEmbed(preview.url);
                  return embed.kind === "file" ? (
                    <video
                      src={embed.src}
                      controls
                      autoPlay
                      className="h-full w-full"
                    />
                  ) : (
                    <iframe
                      src={embed.src}
                      title={preview.title || "معاينة"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
