import type { Metadata } from "next";
import { getPaymentContent } from "@/lib/payment";
import { PaymentView } from "@/components/PaymentView";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "طرق الدفع | أكاديمية رضا حماد التعليمية",
  description: "طرق الدفع المتاحة في أكاديمية رضا حماد التعليمية — بطاقة بنكية، Apple Pay، وتحويل بنكي.",
};

export default async function PaymentPage() {
  const content = await getPaymentContent();

  return (
    <div className="pt-28 sm:pt-32">
      <section className="relative overflow-hidden bg-grid py-16">
        <div className="pointer-events-none absolute -left-20 -top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700">
              طرق الدفع
            </span>
            <h1 className="mt-6 text-4xl font-black text-brand-900 sm:text-5xl">
              ادفع بسهولة وأمان
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-900/65">
              اختر الطريقة الأنسب لك لإتمام اشتراكك في الأكاديمية.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Reveal>
          <PaymentView content={content} />
        </Reveal>
      </section>
    </div>
  );
}
