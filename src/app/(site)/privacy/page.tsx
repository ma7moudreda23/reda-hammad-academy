import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/LegalLayout";
import { BRAND_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | أكاديمية رضا حماد التعليمية",
  description: "سياسة الخصوصية الخاصة بأكاديمية رضا حماد التعليمية.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="سياسة الخصوصية"
      subtitle="نوضّح في هذه الصفحة كيف نجمع بياناتك ونستخدمها ونحميها."
    >
      <p>
        تهتم {BRAND_NAME} بخصوصية مستخدميها وحماية بياناتهم الشخصية. باستخدامك
        للموقع أو الاشتراك في أي من الكورسات فإنك توافق على ما ورد في هذه السياسة.
      </p>

      <LegalSection title="البيانات التي نجمعها">
        <p>قد نجمع البيانات التالية عند التسجيل أو الاشتراك:</p>
        <ul className="list-disc space-y-1.5 pr-6">
          <li>الاسم والبريد الإلكتروني ورقم الهاتف.</li>
          <li>بيانات الاشتراك في الكورسات وتقدّمك التعليمي.</li>
          <li>
            بيانات الدفع تتم معالجتها بالكامل عبر بوّابة الدفع الآمنة{" "}
            <span className="font-bold">Stripe</span>، ونحن لا نقوم بتخزين بيانات
            بطاقتك البنكية على خوادمنا.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="كيف نستخدم بياناتك">
        <ul className="list-disc space-y-1.5 pr-6">
          <li>تفعيل اشتراكك في الكورسات وتقديم الخدمة التعليمية.</li>
          <li>التواصل معك بخصوص حسابك أو الدعم الفني أو التحديثات.</li>
          <li>تحسين جودة المحتوى وتجربة الاستخدام.</li>
        </ul>
      </LegalSection>

      <LegalSection title="المدفوعات والأمان">
        <p>
          تتم جميع عمليات الدفع عبر بوّابة <span className="font-bold">Stripe</span>{" "}
          المتوافقة مع أعلى معايير الأمان العالمية (PCI-DSS). الأسعار معروضة
          بالريال السعودي ما لم يُذكر غير ذلك.
        </p>
      </LegalSection>

      <LegalSection title="ملفات تعريف الارتباط (Cookies)">
        <p>
          نستخدم ملفات تعريف الارتباط لحفظ جلسة الدخول وتحسين تجربتك على الموقع.
          يمكنك التحكم بها من إعدادات متصفحك.
        </p>
      </LegalSection>

      <LegalSection title="حقوقك">
        <p>
          يحق لك الوصول إلى بياناتك أو تعديلها أو طلب حذفها في أي وقت، وذلك
          بالتواصل معنا عبر قنوات الدعم الخاصة بالأكاديمية.
        </p>
      </LegalSection>

      <LegalSection title="التواصل">
        <p>
          لأي استفسار بخصوص الخصوصية أو بياناتك، تواصل معنا عبر صفحة «تواصل معنا»
          أو الدعم الفني الخاص بالأكاديمية.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
