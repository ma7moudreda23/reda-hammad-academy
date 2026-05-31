"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CourseSection, CourseItemType } from "@/lib/curriculum";
import {
  PlayIcon,
  FileIcon,
  ExamIcon,
  ChevronIcon,
} from "@/components/icons";

const TYPE_META: Record<CourseItemType, { label: string; Icon: typeof PlayIcon }> = {
  video: { label: "فيديو", Icon: PlayIcon },
  file: { label: "ملف", Icon: FileIcon },
  exam: { label: "اختبار", Icon: ExamIcon },
};

export function CourseCurriculum({ sections }: { sections: CourseSection[] }) {
  const [open, setOpen] = useState<number | null>(0);

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
                        return (
                          <li
                            key={j}
                            className="flex items-center justify-between gap-3 px-5 py-3"
                          >
                            <span className="flex items-center gap-3">
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="font-semibold text-brand-900/80">
                                {item.title}
                              </span>
                            </span>
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
                              {meta.label}
                            </span>
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
    </div>
  );
}
