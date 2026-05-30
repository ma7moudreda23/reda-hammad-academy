import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, parseCurriculum, parseStringList } from "@/lib/courses";
import { PLATFORM_URL } from "@/lib/site";
import { Reveal } from "@/components/motion";
import { AcademicIcon, ArrowIcon, CheckIcon } from "@/components/icons";
import { CourseCurriculum } from "@/components/CourseCurriculum";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "كورس غير موجود" };
  return {
    title: `${course.title} | أكاديمية رضا حماد التعليمية`,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.isPublished) notFound();

  const link = course.platformUrl || PLATFORM_URL;
  const curriculum = parseCurriculum(course.curriculum);
  const features = parseStringList(course.features);

  return (
    <div className="pt-28 sm:pt-32">
      <section className="mx-auto max-w-5xl px-5 py-12">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
        >
          <ArrowIcon className="h-4 w-4 rotate-180" />
          كل الكورسات
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-video overflow-hidden rounded-card border border-brand-100 bg-brand-50 shadow-lg">
              {course.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-500">
                  <AcademicIcon className="h-20 w-20" />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {course.badge && (
              <span className="inline-block rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-brand-900">
                {course.badge}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-black text-brand-900 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-brand-900/70">
              {course.description}
            </p>

            {course.price && (
              <p className="mt-6 text-3xl font-black text-brand-700">
                {course.price}
                {course.currency ? ` ${course.currency}` : ""}
              </p>
            )}

            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl"
            >
              اشترك الآن على المنصة
              <ArrowIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </a>

            {features.length > 0 && (
              <ul className="mt-6 space-y-2.5 rounded-card border border-brand-100 bg-brand-50/50 p-5">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold text-brand-900/80">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>

        {course.longDescription && (
          <Reveal className="mt-14">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-brand-900">
              <CheckIcon className="h-6 w-6 text-brand-600" />
              تفاصيل الكورس
            </h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-8 text-brand-900/70">
              {course.longDescription}
            </p>
          </Reveal>
        )}

        <CourseCurriculum sections={curriculum} />
      </section>
    </div>
  );
}
