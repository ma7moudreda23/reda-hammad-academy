// Runs once when the Next.js server starts.
// Ensures the database schema exists and is seeded (works on managed hosting
// where the Prisma schema-engine binary can't be executed).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDatabase } = await import("@/lib/init-db");
    await ensureDatabase();
  }
}
