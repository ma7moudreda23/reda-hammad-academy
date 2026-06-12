"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowIcon, AcademicIcon } from "@/components/icons";

export type CourseView = {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  currency: string;
  badge: string;
  category: string;
  platformUrl: string;
};

export function CourseCard({ course, index = 0 }: { course: CourseView; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-card border border-brand-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/10"
    >
      <div className="relative aspect-video overflow-hidden bg-brand-50">
        {course.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={course.imageUrl}
            alt={course.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-500">
            <AcademicIcon className="h-14 w-14" />
          </div>
        )}
        {course.badge && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-brand-900 shadow-md">
            {course.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold text-brand-900">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-7 text-brand-900/65">
          {course.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          {course.price ? (
            <span className="text-lg font-extrabold text-brand-700">
              {course.price}
              {course.currency ? ` ${course.currency}` : ""}
            </span>
          ) : (
            <span className="text-sm font-semibold text-brand-500">سجّل الآن</span>
          )}
          <a
            href={course.platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-700"
          >
            اشترك الآن
            <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover/btn:-translate-x-1" />
          </a>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="mt-3 text-center text-xs font-semibold text-brand-500 transition-colors hover:text-brand-700"
        >
          عرض التفاصيل
        </Link>
      </div>
    </motion.article>
  );
}
