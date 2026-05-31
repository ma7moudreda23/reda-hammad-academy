// Runs once when the Next.js server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Safety net: never let a stray async/DB error crash the server process
  // (the site stays up; data queries are already resilient).
  process.on("unhandledRejection", (e) => {
    console.error("unhandledRejection:", e);
  });
  process.on("uncaughtException", (e) => {
    console.error("uncaughtException:", e);
  });

  // Fire-and-forget DB setup so it never blocks server readiness.
  import("@/lib/init-db")
    .then(({ ensureDatabase }) => ensureDatabase())
    .catch((e) => console.error("instrumentation: ensureDatabase failed", e));
}
