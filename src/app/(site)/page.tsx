import { getHomeContent } from "@/lib/content";
import { getFeaturedCourses } from "@/lib/courses";
import { HomeSections } from "@/components/home/HomeSections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, featured] = await Promise.all([
    getHomeContent(),
    getFeaturedCourses(),
  ]);

  return <HomeSections content={content} featured={featured} />;
}
