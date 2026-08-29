"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Meta (Facebook) Pixel. The base snippet loads fbevents.js once and fires the
// first PageView; a pathname effect fires PageView again on client-side
// navigation so single-page route changes are counted too.
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    const id = pixelId.trim();
    if (!id) return;

    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (!w.fbq) {
      /* eslint-disable */
      // Standard Meta Pixel base code.
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
      w.fbq!("init", id);
    }
    // First PageView (guarded so it only runs once even under strict mode).
    if (!started.current) {
      started.current = true;
      w.fbq!("track", "PageView");
    }
  }, [pixelId]);

  // Subsequent client-side navigations.
  useEffect(() => {
    if (!started.current) return;
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (w.fbq) w.fbq("track", "PageView");
  }, [pathname]);

  const id = pixelId.trim();
  if (!id) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        alt=""
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
