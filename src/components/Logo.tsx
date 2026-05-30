"use client";

import { useState } from "react";

/**
 * LogoMark — crisp navy square with gold "RH" monogram.
 * Scales perfectly at any size and works on light or dark backgrounds.
 */
export function LogoMark({
  className = "h-9 w-9 text-base",
  variant = "navy",
}: {
  className?: string;
  variant?: "navy" | "gold";
}) {
  const colors =
    variant === "gold"
      ? "bg-accent-500 text-brand-900"
      : "bg-brand-700 text-accent-400";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl font-black leading-none shadow-sm ${colors} ${className}`}
      aria-hidden
    >
      RH
    </span>
  );
}

/**
 * BrandLogo — the full uploaded logo image (/logo.png).
 * Falls back to the LogoMark if the file isn't present yet.
 */
export function BrandLogo({
  className = "",
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return <LogoMark className={markClassName ?? "h-24 w-24 text-3xl"} />;
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo.png"
      alt="أكاديمية رضا حماد التعليمية"
      className={className}
      onError={() => setError(true)}
    />
  );
}
