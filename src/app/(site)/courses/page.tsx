import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses";
import { CoursesBrowser } from "@/components/CoursesBrowser";
import { Reveal } from "@/components/motion";
import { AcademicIcon, ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الكورسات | أكاديمية رضا حماد التعليمية",
  description: "تصفّح كل كورسات أكاديمية رضا حماد التعليمية واختر الأنسب لك.",
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="pt-28 sm:pt-32">
      {/* Header */}
      <section className="relative overflow-hidden bg-grid py-16">
        <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
              <AcademicIcon className="h-4 w-4" />
              كل الكورسات
            </span>
            <h1 className="mt-6 text-4xl font-black text-brand-900 sm:text-5xl">
              اختر كورسك وابدأ التفوّق
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-900/65">
              مجموعة كورسات احترافية مصمّمة بعناية مع الأستاذ رضا حماد. اضغط
              «اشترك الآن» لتنتقل لمنصة التعلّم وتبدأ فورًا.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Grid + filter */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        {courses.length > 0 ? (
          <CoursesBrowser courses={courses} />
        ) : (
          <div className="rounded-card border border-dashed border-brand-200 bg-white p-16 text-center">
            <AcademicIcon className="mx-auto h-14 w-14 text-brand-300" />
            <p className="mt-4 text-lg font-bold text-brand-900">
              لا توجد كورسات منشورة حاليًا
            </p>
            <p className="mt-2 text-brand-900/60">
              يمكن للأدمن إضافة كورسات من لوحة التحكم.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-700"
            >
              العودة للرئيسية
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
