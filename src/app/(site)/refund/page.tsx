import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "سياسة الدفع والاسترجاع | أكاديمية رضا حماد التعليمية",
  description:
    "سياسة الدفع والاسترجاع والدعم الفني في أكاديمية رضا حماد التعليمية.",
};

export default function RefundPage() {
  return (
    <LegalLayout
      title="سياسة الدفع والاسترجاع"
      subtitle="تفاصيل الدفع، شروط الاسترجاع، والدعم الفني للكورسات."
    >
      <LegalSection title="الدفع">
        <ul className="list-disc space-y-1.5 pr-6">
          <li>
            تتم جميع المدفوعات إلكترونيًا عبر بوّابة الدفع الآمنة{" "}
            <span className="font-bold">Stripe</span>.
          </li>
          <li>الأسعار معروضة بالريال السعودي ما لم يُذكر غير ذلك.</li>
          <li>
            يتم تفعيل الاشتراك في الكورس فور إتمام عملية الدفع بنجاح ووصول تأكيد
            العملية.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="سياسة الاسترجاع">
        <ul className="list-disc space-y-1.5 pr-6">
          <li>
            يمكن طلب استرداد المبلغ خلال <span className="font-bold">7 أيام</span>{" "}
            من تاريخ الشراء، بشرط عدم استهلاك أكثر من 20% من محتوى الكورس.
          </li>
          <li>
            بعد مرور المدة أو تجاوز نسبة المشاهدة المذكورة، يُعتبر المحتوى الرقمي
            مُستهلكًا ولا يكون قابلًا للاسترجاع.
          </li>
          <li>
            في حال وجود مشكلة تقنية تمنع الوصول للمحتوى ولم يتم حلّها، يحق لك طلب
            الاسترجاع الكامل.
          </li>
          <li>
            تتم معالجة المبالغ المستردّة عبر نفس وسيلة الدفع خلال مدة تتراوح بين
            5 و14 يوم عمل حسب البنك وبوّابة الدفع.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="الدعم الفني">
        <p>
          كل كورس في {BRAND_NAME} مدعوم بـ
          <span className="font-bold"> دعم فني </span>
          لحل أي مشكلة تقنية أو استفسار يواجهك أثناء الاشتراك أو مشاهدة المحتوى.
          نلتزم بالرد على طلبات الدعم في أسرع وقت ممكن.
        </p>
      </LegalSection>

      <LegalSection title="التواصل">
        <p>
          لطلب الاسترجاع أو الدعم الفني، تواصل معنا عبر صفحة «تواصل معنا» أو قنوات
          الدعم الخاصة بالأكاديمية مع ذكر بريدك ورقم العملية.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
