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
};

export default nextConfig;
