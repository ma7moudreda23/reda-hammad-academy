import type { Metadata } from "next";
import { getHomeContent } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { StudentResultsGallery } from "@/components/StudentResultsGallery";
import { StarIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إنجازات طلابنا | أكاديمية رضا حماد التعليمية",
  description: "نتائج وإنجازات طلاب أكاديمية رضا حماد التعليمية.",
};

export default async function StudentsPage() {
  const { studentResults } = await getHomeContent();

  return (
    <div className="pt-28 sm:pt-32">
      <section className="relative overflow-hidden bg-grid py-16">
        <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/50 bg-accent-500/10 px-4 py-1.5 text-sm font-bold text-accent-600">
              <StarIcon className="h-4 w-4" />
              إنجازات الطلاب
            </span>
            <h1 className="mt-6 text-4xl font-black text-brand-900 sm:text-5xl">
              {studentResults.title}
            </h1>
            {studentResults.subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-900/65">
                {studentResults.subtitle}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <StudentResultsGallery items={studentResults.items} />
      </section>
    </div>
  );
}
