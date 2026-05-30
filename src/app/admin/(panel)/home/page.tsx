import { getHomeContent } from "@/lib/content";
import { HomeEditor } from "@/components/admin/HomeEditor";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const content = await getHomeContent();
  return <HomeEditor initial={content} />;
}
