import { prisma } from "@/lib/db";
import { PLATFORM_URL } from "@/lib/site";
import { getPaymentContent } from "@/lib/payment";
import { CourseManager, type AdminCourse } from "@/components/admin/CourseManager";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const rows = await prisma.course.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const payment = await getPaymentContent();

  const courses: AdminCourse[] = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    longDescription: c.longDescription,
    curriculum: c.curriculum,
    features: c.features,
    imageUrl: c.imageUrl,
    price: c.price,
    currency: c.currency,
    badge: c.badge,
    category: c.category,
    paymentNote: c.paymentNote ?? "",
    showBankTransfer: c.showBankTransfer,
    paymentBanks: c.paymentBanks ?? "all",
    platformUrl: c.platformUrl,
    isPublished: c.isPublished,
    isFeatured: c.isFeatured,
    sortOrder: c.sortOrder,
  }));

  return (
    <CourseManager
      initial={courses}
      defaultPlatformUrl={PLATFORM_URL}
      banks={payment.banks}
    />
  );
}
