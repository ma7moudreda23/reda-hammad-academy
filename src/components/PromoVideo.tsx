"use client";

import { useEffect, useRef, useState } from "react";

export function youTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      return (
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/)?.[1] ??
        null
      );
    }
    return null;
  } catch {
    return null;
  }
}

const GESTURES = ["pointerdown", "keydown", "touchstart", "scroll"];

// A YouTube embed weighs far more than the rest of the page, so only a thumbnail
// loads at first. The player replaces it on tap. An autoplay video starts muted
// on the visitor's first gesture anywhere on the page.
function YouTubeVideo({ id, autoplay, title }: { id: string; autoplay: boolean; title: string }) {
  const [mode, setMode] = useState<"thumbnail" | "muted" | "sound">("thumbnail");

  useEffect(() => {
    if (!autoplay || mode !== "thumbnail") return;
    const start = () => setMode("muted");
    GESTURES.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return () => GESTURES.forEach((e) => window.removeEventListener(e, start));
  }, [autoplay, mode]);

  if (mode !== "thumbnail") {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${id}?autoplay=1${mode === "muted" ? "&mute=1" : ""}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setMode("sound")}
      aria-label={`تشغيل الفيديو: ${title}`}
      className="group relative block h-full w-full cursor-pointer overflow-hidden bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}

export function PromoVideo({
  url,
  autoplay,
  title,
}: {
  url: string;
  autoplay: boolean;
  title: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const ytId = youTubeId(url);

  // Autoplay starts muted (browser policy). On the first user gesture
  // anywhere on the page, unmute so the sound kicks in automatically.
  useEffect(() => {
    if (!autoplay || ytId) return;
    const v = ref.current;
    if (!v) return;

    const unmute = () => {
      try {
        v.muted = false;
        v.volume = 1;
        void v.play();
      } catch {
        /* ignore */
      }
      GESTURES.forEach((e) => window.removeEventListener(e, unmute));
    };
    GESTURES.forEach((e) =>
      window.addEventListener(e, unmute, { passive: true }),
    );
    return () => GESTURES.forEach((e) => window.removeEventListener(e, unmute));
  }, [autoplay, ytId]);

  if (ytId) {
    return <YouTubeVideo id={ytId} autoplay={autoplay} title={title} />;
  }

  return (
    <video
      ref={ref}
      src={url}
      controls
      playsInline
      preload="metadata"
      autoPlay={autoplay}
      muted={autoplay}
      loop={autoplay}
      className="h-full w-full"
    />
  );
}
