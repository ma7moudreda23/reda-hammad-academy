"use client";

import { useEffect, useRef } from "react";

function toEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be"))
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}
const isYouTube = (url: string) => /youtu\.?be/.test(url);

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

  // Autoplay starts muted (browser policy). On the first user gesture
  // anywhere on the page, unmute so the sound kicks in automatically.
  useEffect(() => {
    if (!autoplay || isYouTube(url)) return;
    const v = ref.current;
    if (!v) return;

    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    const unmute = () => {
      try {
        v.muted = false;
        v.volume = 1;
        void v.play();
      } catch {
        /* ignore */
      }
      events.forEach((e) => window.removeEventListener(e, unmute));
    };
    events.forEach((e) =>
      window.addEventListener(e, unmute, { passive: true }),
    );
    return () => events.forEach((e) => window.removeEventListener(e, unmute));
  }, [autoplay, url]);

  if (isYouTube(url)) {
    return (
      <iframe
        src={`${toEmbed(url)}${autoplay ? "?autoplay=1&mute=1" : ""}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    );
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
