import Link from "next/link";
import { prisma } from "@/lib/db";
import { AcademicIcon, DeviceIcon, ArrowIcon, ChartIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [total, published] = await Promise.all([
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
  ]);

  const cards = [
    {
      href: "/admin/home",
      title: "محتوى الصفحة الرئيسية",
      desc: "عدّل النصوص والصور والفيديوهات والإحصائيات وآراء الطلاب.",
      icon: DeviceIcon,
    },
    {
      href: "/admin/courses",
      title: "إدارة الكورسات",
      desc: "أضف كورس جديد، عدّل التفاصيل والصور والأسعار والروابط.",
      icon: AcademicIcon,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-brand-900">أهلاً بك في لوحة التحكم</h1>
      <p className="mt-2 text-brand-900/60">
        من هنا تقدر تتحكّم في كل محتوى الموقع.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-card border border-brand-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <AcademicIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-brand-900">{total}</p>
              <p className="text-sm text-brand-900/60">إجمالي الكورسات</p>
            </div>
          </div>
        </div>
        <div className="rounded-card border border-brand-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ChartIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-brand-900">{published}</p>
              <p className="text-sm text-brand-900/60">كورسات منشورة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-card border border-brand-100 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 flex items-center gap-2 text-lg font-extrabold text-brand-900">
                {c.title}
                <ArrowIcon className="h-4 w-4 text-brand-400 transition-transform group-hover:-translate-x-1" />
              </h2>
              <p className="mt-2 text-sm leading-7 text-brand-900/60">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
