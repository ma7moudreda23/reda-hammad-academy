"use client";

import { useEffect, useState } from "react";
import type { PromoCheck, PromoProblem } from "@/lib/promo";

const PROBLEMS: Record<PromoProblem, string> = {
  "no-key": "المفتاح STRIPE_PROMO_KEY مش موجود على السيرفر. ضيفه في متغيرات البيئة وأعد تشغيل الموقع.",
  "bad-key": "Stripe رفض المفتاح. راجع إنك ناسخه كامل ولسه شغال.",
  "no-permission": "المفتاح شغال بس صلاحياته ناقصة. اديله Read على Promotion Codes وعلى Coupons.",
  "not-found": "Stripe مش لاقي الكود ده. راجع كتابته، وإن المفتاح من نفس وضع الكود (Test أو Live).",
  "no-limit": "الكود موجود بس مفيش حد لعدد الاستخدام، لا عليه ولا على الكوبون، فالعداد مش هيظهر.",
  unreachable: "تعذّر الاتصال بـ Stripe دلوقتي. افتح الكورس تاني بعد شوية.",
};

export function PromoCodeCheck({ code }: { code: string }) {
  const trimmed = code.trim();
  const [result, setResult] = useState<{ code: string; check: PromoCheck } | null>(null);

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/promo-check?code=${encodeURIComponent(trimmed)}`);
        const check: PromoCheck = res.ok ? await res.json() : { problem: "unreachable" };
        if (!cancelled) setResult({ code: trimmed, check });
      } catch {
        if (!cancelled) setResult({ code: trimmed, check: { problem: "unreachable" } });
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [trimmed]);

  if (!trimmed) return null;
  if (result?.code !== trimmed) {
    return <p className="mt-2 text-xs font-bold text-brand-900/45">جاري فحص الكود في Stripe...</p>;
  }

  const { check } = result;
  if ("problem" in check) {
    return <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{PROBLEMS[check.problem]}</p>;
  }
  return (
    <p className={`mt-2 rounded-lg px-3 py-2 text-xs font-bold ${check.status.ended ? "bg-brand-50 text-brand-900/60" : "bg-emerald-50 text-emerald-700"}`}>
      {check.status.ended
        ? `الكود متصل بس خلص أو متوقف: اتبقى ${check.status.remaining} من ${check.status.total}، والموقع هيعرض «انتهت مقاعد الخصم».`
        : `✓ متصل بـ Stripe: متبقي ${check.status.remaining} من ${check.status.total}، والعداد هيظهر في الموقع بعد الحفظ.`}
    </p>
  );
}
