"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomeContent } from "@/lib/content";
import { PromoVideo } from "@/components/PromoVideo";
import { CloseIcon } from "@/components/icons";

type Popup = HomeContent["popup"];

// A tiny stable signature of the popup content. When the admin changes the
// announcement, the signature changes, so a viewer who dismissed the old one
// sees the new one. (Not for security — just cache-busting the dismissal.)
function signature(p: Popup): string {
  const raw = [p.title, p.body, p.mediaType, p.imageUrl, p.videoUrl, p.buttonText, p.buttonLink].join("|");
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

const KEY = "rha_popup_dismissed";

export function AnnouncementPopup({ popup }: { popup: Popup }) {
  const sig = useMemo(() => signature(popup), [popup]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup.enabled) return;
    let dismissed: string | null = null;
    try {
      dismissed = localStorage.getItem(KEY);
    } catch {
      /* storage blocked — just show it */
    }
    if (dismissed === sig) return;
    // Small delay so the page paints first, then the popup animates in.
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [popup.enabled, sig]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, sig);
    } catch {
      /* ignore */
    }
  }

  if (!popup.enabled || !open) return null;

  const hasImage = popup.mediaType === "image" && !!popup.imageUrl;
  const hasVideo = popup.mediaType === "video" && !!popup.videoUrl;
  const hasCta = !!popup.buttonText && !!popup.buttonLink;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || "إعلان"}
      dir="rtl"
      onClick={close}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-[popupIn_.25s_ease-out] relative w-full max-w-lg overflow-hidden rounded-card border border-brand-100 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="إغلاق الإعلان"
          className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-brand-900/60 text-white transition-colors hover:bg-brand-900"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {hasVideo && (
          <div className="aspect-video w-full bg-black">
            <PromoVideo url={popup.videoUrl} autoplay={false} title={popup.title || "إعلان"} />
          </div>
        )}
        {hasImage && !hasVideo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={popup.imageUrl} alt={popup.title || "إعلان"} className="max-h-[55vh] w-full object-cover" />
        )}

        {(popup.title || popup.body || hasCta) && (
          <div className="p-6 text-center">
            {popup.title && (
              <h2 className="text-2xl font-black text-brand-900">{popup.title}</h2>
            )}
            {popup.body && (
              <p className="mt-3 whitespace-pre-line leading-8 text-brand-900/70">{popup.body}</p>
            )}
            {hasCta && (
              <a
                href={popup.buttonLink}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-600 px-7 py-3 font-extrabold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-700"
              >
                {popup.buttonText}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
