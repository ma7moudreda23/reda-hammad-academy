// Runs once when the server boots. Guarded by NEXT_RUNTIME and using a
// dynamic import so no Node-only code is ever pulled into the Edge bundle
// (importing node modules at top level here breaks middleware/Edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
