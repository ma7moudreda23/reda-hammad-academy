import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة | أكاديمية رضا حماد التعليمية",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-20">
      <div className="text-center">
        <p className="text-7xl font-black text-brand-200 sm:text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl">
          الصفحة غير موجودة
        </h1>
        <p className="mx-auto mt-3 max-w-md text-brand-900/60">
          يبدو أن الرابط غير صحيح أو أن الصفحة نُقلت. تقدر ترجع للرئيسية أو تتصفّح الكورسات.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-6 py-3 font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            تصفّح الكورسات
          </Link>
        </div>
      </div>
    </main>
  );
}
