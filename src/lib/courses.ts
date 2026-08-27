import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbQuery } from "@/lib/db";
import { PLATFORM_URL } from "@/lib/site";
import { CACHE_TAGS, CONTENT_REVALIDATE_SECONDS } from "@/lib/cache";
import type { CourseView } from "@/components/CourseCard";

const coursesCacheOpts = {
  tags: [CACHE_TAGS.courses],
  revalidate: CONTENT_REVALIDATE_SECONDS,
};

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
  oldPrice: string;
  priceNote: string | null;
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
    oldPrice: c.oldPrice,
    priceNote: c.priceNote ?? "",
    currency: c.currency,
    badge: c.badge,
    category: c.category,
    platformUrl: c.platformUrl || PLATFORM_URL,
  };
}

const loadPublishedCourses = unstable_cache(
  async (limit?: number): Promise<CourseView[]> => {
    const rows = await dbQuery(
      () =>
        prisma.course.findMany({
          where: { isPublished: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          ...(limit ? { take: limit } : {}),
        }),
      [],
    );
    return rows.map(toView);
  },
  ["published-courses"],
  coursesCacheOpts,
);
export const getPublishedCourses = cache(loadPublishedCourses);

const loadFeaturedCourses = unstable_cache(
  async (): Promise<CourseView[]> => {
    const rows = await dbQuery(
      () =>
        prisma.course.findMany({
          where: { isPublished: true, isFeatured: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        }),
      [],
    );
    return rows.map(toView);
  },
  ["featured-courses"],
  coursesCacheOpts,
);
export const getFeaturedCourses = cache(loadFeaturedCourses);

const loadCourseBySlug = unstable_cache(
  async (slug: string) => {
    return dbQuery(() => prisma.course.findUnique({ where: { slug } }), null);
  },
  ["course-by-slug"],
  coursesCacheOpts,
);
export const getCourseBySlug = cache(loadCourseBySlug);
