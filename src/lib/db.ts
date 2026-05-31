import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  // Fall back to a dummy URL so importing this module never throws (e.g. during
  // build). Real connection happens lazily; queries are wrapped in try/catch.
  const url = process.env.DATABASE_URL || "mysql://user:pass@localhost:3306/db";
  const adapter = new PrismaMariaDb(url);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
