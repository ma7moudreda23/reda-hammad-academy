// Runs once when the Next.js server starts.
// Ensures the database schema exists and is seeded. Wrapped so a DB problem
// never crashes server startup (the site still loads; errors show in logs).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureDatabase } = await import("@/lib/init-db");
    await ensureDatabase();
  } catch (e) {
    console.error("instrumentation: ensureDatabase failed", e);
  }
}
