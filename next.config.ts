import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
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
    return [
      {
        source: "/:path*",
        headers: [
          // Block clickjacking (framing the admin/login).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
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
