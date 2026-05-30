"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowIcon, AcademicIcon } from "@/components/icons";
import { BrandLogo } from "@/components/Logo";

export function LoginRedirect({ platformUrl }: { platformUrl: string }) {
  const [counting, setCounting] = useState(3);

  useEffect(() => {
    if (counting <= 0) {
      window.location.href = platformUrl;
      return;
    }
    const t = setTimeout(() => setCounting((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counting, platformUrl]);

  return (
    <div className="grid min-h-screen place-items-center bg-grid px-5 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[2rem] border border-brand-100 bg-white p-8 text-center shadow-2xl shadow-brand-900/10 sm:p-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
          className="mx-auto h-28 w-28"
        >
          <BrandLogo
            className="h-full w-full object-contain"
            markClassName="h-28 w-28 rounded-3xl text-4xl"
          />
        </motion.div>

        <h1 className="mt-6 text-2xl font-black text-brand-900">
          الدخول لمنصة التعلّم
        </h1>
        <p className="mt-3 leading-7 text-brand-900/65">
          جاري تحويلك إلى أكاديمية رضا حماد التعليمية خلال{" "}
          <span className="font-extrabold text-brand-600">{counting}</span>{" "}
          ثوانٍ. لو ما اتحوّلتش تلقائيًا، اضغط الزر بالأسفل.
        </p>

        <a
          href={platformUrl}
          className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700"
        >
          الانتقال للمنصة الآن
          <ArrowIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </a>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-brand-900/45">
          <AcademicIcon className="h-4 w-4" />
          أكاديمية رضا حماد التعليمية
        </div>
      </motion.div>
    </div>
  );
}
