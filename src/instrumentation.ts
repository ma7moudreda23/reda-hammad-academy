// Runs once when the Next.js server starts.
// Fire-and-forget so DB setup never blocks/delays server readiness; any error
// is swallowed (the site stays up; queries are resilient).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  import("@/lib/init-db")
    .then(({ ensureDatabase }) => ensureDatabase())
    .catch((e) => console.error("instrumentation: ensureDatabase failed", e));
}
