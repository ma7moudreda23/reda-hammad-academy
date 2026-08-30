"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a Meta "ViewContent" event when a visitor opens one of the three
// Mawhiba course pages, so ad campaigns can optimize on that intent.
// Slugs must match the real course URLs (seeded as mawhiba-level-1/2/3).
const MAWHIBA_PAGES: Record<string, string> = {
  "/courses/mawhiba-level-1": "مقياس موهبة — المستوى الأول",
  "/courses/mawhiba-level-2": "مقياس موهبة — المستوى الثاني",
  "/courses/mawhiba-level-3": "مقياس موهبة — المستوى الثالث",
};

export default function MetaViewContentTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const name = MAWHIBA_PAGES[pathname];
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (name && typeof w.fbq === "function") {
      w.fbq("track", "ViewContent", {
        content_name: name,
        content_category: "مقياس موهبة",
        content_type: "product",
      });
    }
  }, [pathname]);

  return null;
}
