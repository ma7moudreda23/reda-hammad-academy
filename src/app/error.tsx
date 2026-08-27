"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for server/client logs; no sensitive data is shown to users.
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-20">
      <div className="text-center">
        <p className="text-6xl font-black text-brand-200 sm:text-7xl">عذرًا</p>
        <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl">
          حدث خطأ غير متوقع
        </h1>
        <p className="mx-auto mt-3 max-w-md text-brand-900/60">
          واجهنا مشكلة أثناء تحميل هذه الصفحة. جرّب إعادة المحاولة، وإذا استمرت المشكلة تواصل معنا.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-brand-900/40">رمز الخطأ: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-bold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-6 py-3 font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </main>
  );
}
