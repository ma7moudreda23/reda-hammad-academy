import { getHomeContent } from "@/lib/content";
import { getFeaturedCourses } from "@/lib/courses";
import { HomeSections } from "@/components/home/HomeSections";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, featured] = await Promise.all([
    getHomeContent(),
    getFeaturedCourses(),
  ]);

  return (
    <>
      <AnnouncementPopup popup={content.popup} />
      <HomeSections content={content} featured={featured} />
    </>
  );
}
