import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: path.join(__dirname),
  },
  // keep the DB driver external on the server
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb"],
  // Shared CloudLinux host has a low process limit. Cap the number of build
  // workers (default = CPU count, which spiked to ~22) and skip preloading all
  // route entries at startup, to keep the process/thread count well under limit.
  experimental: {
    cpus: 2,
    preloadEntriesOnStart: false,
  },
  async headers() {
    const publicImage = [
      { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
    ];
    return [
      { source: "/reda.jpg", headers: publicImage },
      { source: "/logo.png", headers: publicImage },
      { source: "/pay/:path*", headers: publicImage },
      { source: "/banks/:path*", headers: publicImage },
      {
        source: "/:path*",
        headers: [
          // Block cross-site framing (clickjacking) but allow the site to embed
          // its own uploaded files (PDF previews) on its own pages.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          // Stop MIME sniffing of responses.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak full URLs to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Lock down powerful browser features.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // Force HTTPS once visited.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
