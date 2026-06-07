import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  // Fall back to a dummy URL so importing this module never throws (e.g. during
  // build). Real connection happens lazily; queries are wrapped in try/catch.
  const url = process.env.DATABASE_URL || "mysql://user:pass@localhost:3306/db";
  // Parse into a pool config so we can add timeouts — a wrong/unreachable host
  // must fail fast instead of hanging SSR (which trips the host health check).
  let adapter: PrismaMariaDb;
  try {
    const u = new URL(url);
    adapter = new PrismaMariaDb({
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      connectTimeout: 2500,
      acquireTimeout: 2500,
      // Keep the pool small — the shared host limits total processes/threads.
      connectionLimit: 3,
      idleTimeout: 30,
    });
  } catch {
    adapter = new PrismaMariaDb(url);
  }
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Run a DB query but never let it block a page render. If the database is
 * unreachable or slow (e.g. wrong host / network blackhole), the query can
 * hang instead of throwing — which freezes SSR and trips the host's health
 * check, restarting the container in a loop. This guarantees a fast fallback
 * so the public pages always respond quickly.
 */
export async function dbQuery<T>(run: () => Promise<T>, fallback: T, ms = 3000): Promise<T> {
  try {
    return await Promise.race([
      run(),
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
  } catch {
    return fallback;
  }
}
