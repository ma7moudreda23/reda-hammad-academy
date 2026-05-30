"use client";

import { useState } from "react";
import { CourseCard, type CourseView } from "@/components/CourseCard";
import { COURSE_CATEGORIES } from "@/lib/site";
import { AcademicIcon } from "@/components/icons";

const ALL = "الكل";

export function CoursesBrowser({ courses }: { courses: CourseView[] }) {
  const [active, setActive] = useState<string>(ALL);

  const tabs = [ALL, ...COURSE_CATEGORIES];
  const filtered =
    active === ALL ? courses : courses.filter((c) => c.category === active);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-10 flex flex-wrap justify-center gap-2.5">
        {tabs.map((tab) => {
          const isActive = active === tab;
          const count =
            tab === ALL
              ? courses.length
              : courses.filter((c) => c.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "border border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              {tab}
              <span
                className={`mr-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-brand-50 text-brand-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-brand-200 bg-white p-16 text-center">
          <AcademicIcon className="mx-auto h-12 w-12 text-brand-300" />
          <p className="mt-4 text-lg font-bold text-brand-900">
            لا توجد كورسات في «{active}» حاليًا
          </p>
          <p className="mt-2 text-brand-900/60">جرّب فئة أخرى أو تصفّح الكل.</p>
        </div>
      )}
    </div>
  );
}
