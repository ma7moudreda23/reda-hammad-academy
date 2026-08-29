import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsTicker } from "@/components/NewsTicker";
import { MetaPixel } from "@/components/MetaPixel";
import { getHomeContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ticker, metaPixelId } = await getHomeContent();
  const tickerActive = ticker.enabled && ticker.items.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      {metaPixelId?.trim() && <MetaPixel pixelId={metaPixelId} />}
      {tickerActive && (
        <div className="fixed inset-x-0 top-0 z-[60]">
          <NewsTicker items={ticker.items} />
        </div>
      )}
      <Navbar tickerActive={tickerActive} />
      <main className={`flex-1 ${tickerActive ? "pt-11" : ""}`}>{children}</main>
      <Footer />
    </div>
  );
}
