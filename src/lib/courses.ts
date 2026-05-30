import { prisma } from "@/lib/db";
import { PLATFORM_URL } from "@/lib/site";
import type { CourseView } from "@/components/CourseCard";

export {
  parseCurriculum,
  parseStringList,
  type CourseItem,
  type CourseItemType,
  type CourseSection,
} from "@/lib/curriculum";

function toView(c: {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  currency: string;
  badge: string;
  category: string;
  platformUrl: string;
}): CourseView {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    price: c.price,
    currency: c.currency,
    badge: c.badge,
    category: c.category,
    platformUrl: c.platformUrl || PLATFORM_URL,
  };
}

export async function getPublishedCourses(limit?: number): Promise<CourseView[]> {
  try {
    const rows = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...(limit ? { take: limit } : {}),
    });
    return rows.map(toView);
  } catch {
    return [];
  }
}

export async function getFeaturedCourses(): Promise<CourseView[]> {
  try {
    const rows = await prisma.course.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map(toView);
  } catch {
    return [];
  }
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({ where: { slug } });
}
