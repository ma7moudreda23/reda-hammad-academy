"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { HomeContent } from "@/lib/content";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { CourseCard, type CourseView } from "@/components/CourseCard";
import {
  FeatureIcon,
  ArrowIcon,
  CheckIcon,
  StarIcon,
  PlayIcon,
  AcademicIcon,
} from "@/components/icons";
import { BrandLogo } from "@/components/Logo";
import { PromoVideo } from "@/components/PromoVideo";
import { WhatsappIcon } from "@/components/social-icons";

function toEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function HomeSections({
  content,
  featured,
}: {
  content: HomeContent;
  featured: CourseView[];
}) {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-grid pt-32 pb-20 sm:pt-40">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700"
            >
              <StarIcon className="h-4 w-4 text-accent-500" />
              {content.hero.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-4xl font-black leading-tight text-brand-900 sm:text-5xl lg:text-6xl"
            >
              {content.hero.title}{" "}
              <span className="relative whitespace-nowrap text-brand-600">
                {content.hero.highlight}
                <svg
                  className="absolute -bottom-2 right-0 h-3 w-full text-accent-400"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 8 Q 50 0 100 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-8 text-brand-900/70"
            >
              {content.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40"
              >
                {content.hero.primaryCtaText}
                <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3.5 font-bold text-brand-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50"
              >
                {content.hero.secondaryCtaText}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white to-brand-50 shadow-2xl shadow-brand-900/10">
              {content.hero.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={content.hero.imageUrl}
                  alt={content.brandName}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-8">
                  <BrandLogo
                    className="h-full w-full object-contain"
                    markClassName="h-40 w-40 text-6xl"
                  />
                </div>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-6 left-6 flex items-center gap-3 rounded-2xl border border-brand-100 bg-white/90 px-4 py-3 shadow-xl backdrop-blur"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <CheckIcon className="h-5 w-5" />
              </span>
              <div className="text-sm">
                <p className="font-extrabold text-brand-900">تعليم موثوق</p>
                <p className="text-brand-900/60">جودة ومتابعة</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto -mt-6 max-w-6xl px-5">
        <StaggerGroup className="grid grid-cols-2 gap-4 rounded-card border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5 sm:p-8 lg:grid-cols-4">
          {content.stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <p className="text-3xl font-black text-brand-600 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-brand-900/60">{s.label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* PROMO VIDEO */}
      {content.promo.videoUrl && (
        <section className="mx-auto max-w-5xl px-5 pt-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/50 bg-accent-500/10 px-4 py-1.5 text-sm font-bold text-accent-600">
              <PlayIcon className="h-4 w-4" />
              فيديو تعريفي
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 sm:text-4xl">
              {content.promo.title}
            </h2>
            {content.promo.subtitle && (
              <p className="mt-4 text-lg text-brand-900/65">{content.promo.subtitle}</p>
            )}
          </Reveal>

          <Reveal className="mt-10">
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-brand-100 bg-brand-900 shadow-2xl shadow-brand-900/20">
              <PromoVideo
                url={content.promo.videoUrl}
                autoplay={content.promo.autoplay}
                title={content.promo.title}
              />
            </div>
          </Reveal>
        </section>
      )}

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-brand-900 sm:text-4xl">
            ليه تختار أكاديمية رضا حماد التعليمية؟
          </h2>
          <p className="mt-4 text-lg text-brand-900/65">
            بنقدّم تجربة تعليمية متكاملة مصمّمة عشان توصّلك لأفضل نتيجة.
          </p>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.features.map((f) => (
            <StaggerItem
              key={f.title}
              className="group rounded-card border border-brand-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/10"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <FeatureIcon name={f.icon} className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-brand-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-brand-900/65">{f.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-brand-50/60 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-100 to-brand-50 shadow-xl">
              {content.about.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={content.about.imageUrl}
                  alt={content.about.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-400">
                  <AcademicIcon className="h-20 w-20" />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-3xl font-black text-brand-900 sm:text-4xl">
              {content.about.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-brand-900/70">
              {content.about.paragraph}
            </p>
            <ul className="mt-7 space-y-3">
              {content.about.points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-brand-900/80">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* TRAINING TRACKS */}
      {content.trainingTracks.groups.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/50 bg-accent-500/10 px-4 py-1.5 text-sm font-bold text-accent-600">
              <StarIcon className="h-4 w-4" />
              مسارات تدريبية
            </span>
            <h2 className="mt-5 text-3xl font-black text-brand-900 sm:text-4xl">
              {content.trainingTracks.title}
            </h2>
            <p className="mt-4 text-lg text-brand-900/65">
              {content.trainingTracks.subtitle}
            </p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.trainingTracks.groups.map((g) => (
              <StaggerItem
                key={g.category}
                className="flex flex-col rounded-card border border-brand-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-400 hover:shadow-xl hover:shadow-brand-900/10"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-accent-400">
                  <FeatureIcon name={g.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-brand-900">
                  {g.category}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500/15 text-accent-600">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-semibold text-brand-900/75">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* VIDEOS */}
      {content.videos.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="flex items-center justify-center gap-3 text-3xl font-black text-brand-900 sm:text-4xl">
              <PlayIcon className="h-8 w-8 text-accent-500" />
              فيديوهات تعريفية
            </h2>
            <p className="mt-4 text-lg text-brand-900/65">
              شاهد نماذج من شرح الأستاذ رضا حماد.
            </p>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2">
            {content.videos.map((v) => (
              <StaggerItem
                key={v.url}
                className="overflow-hidden rounded-card border border-brand-100 bg-white shadow-sm"
              >
                <div className="aspect-video bg-black">
                  <iframe
                    src={toEmbed(v.url)}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
                {v.title && (
                  <p className="p-4 font-bold text-brand-900">{v.title}</p>
                )}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* FEATURED COURSES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-brand-900 sm:text-4xl">
                كورسات مميزة
              </h2>
              <p className="mt-3 text-lg text-brand-900/65">
                ابدأ بأكثر الكورسات طلبًا.
              </p>
            </div>
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-3 font-bold text-brand-700 transition-all hover:bg-brand-50"
            >
              كل الكورسات
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {content.testimonials.length > 0 && (
        <section className="bg-brand-50/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black text-brand-900 sm:text-4xl">
                آراء طلابنا
              </h2>
              <p className="mt-4 text-lg text-brand-900/65">
                نتائج حقيقية وكلمات من قلب طلابنا وأولياء أمورهم.
              </p>
            </Reveal>
            <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
              {content.testimonials.map((t) => (
                <StaggerItem
                  key={t.name}
                  className="flex flex-col rounded-card border border-brand-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-1 text-accent-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 leading-8 text-brand-900/75">
                    “{t.quote}”
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-brand-100 pt-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 font-extrabold text-white">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-extrabold text-brand-900">{t.name}</p>
                      <p className="text-sm text-brand-900/55">{t.role}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-700 px-6 py-14 text-center shadow-2xl shadow-brand-900/20 sm:px-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-accent-500/20 blur-2xl" />
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">
              {content.cta.title}
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-brand-50/85">
              {content.cta.subtitle}
            </p>
            <Link
              href="/login"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-lg font-extrabold text-brand-900 shadow-lg shadow-accent-500/30 transition-all duration-200 hover:bg-accent-400 hover:shadow-xl"
            >
              {content.cta.buttonText}
              <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CONTACT */}
      {content.contact.whatsapp && (
        <section id="contact" className="mx-auto max-w-4xl px-5 pb-24">
          <Reveal>
            <div className="rounded-[2rem] border border-brand-100 bg-white p-8 text-center shadow-lg shadow-brand-900/5 sm:p-12">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#25D366] text-white shadow-md">
                <WhatsappIcon className="h-9 w-9" />
              </span>
              <h2 className="mt-5 text-3xl font-black text-brand-900 sm:text-4xl">
                {content.contact.title}
              </h2>
              {content.contact.subtitle && (
                <p className="mx-auto mt-3 max-w-xl text-lg text-brand-900/65">
                  {content.contact.subtitle}
                </p>
              )}
              <a
                href={`https://wa.me/${content.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#25D366] px-7 py-4 text-lg font-extrabold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-200 hover:bg-[#1ebe5d] hover:shadow-xl"
              >
                <WhatsappIcon className="h-6 w-6" />
                {content.contact.whatsapp}
              </a>
              <p className="mt-3 text-sm font-semibold text-brand-900/45">
                الدعم الفني عبر واتساب
              </p>
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}
