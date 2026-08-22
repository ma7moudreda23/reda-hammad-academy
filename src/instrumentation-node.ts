// Node-only boot work. Imported dynamically from instrumentation.ts.
//
// Keeps the DB schema in sync automatically on every deploy: new columns are
// added by ensureDatabase()'s idempotent CREATE/ALTER statements. Without this
// a deploy that adds a column would break every course query until someone
// remembered to hit /api/setup manually.
//
// Fire-and-forget: never block or crash startup — a DB hiccup must not take
// the site down.
import { ensureDatabase } from "@/lib/init-db";

ensureDatabase()
  .then((r) => {
    if (r.ok) console.log("[boot] schema ready:", r.message);
    else console.error("[boot] schema init failed:", r.message);
  })
  .catch((e) => console.error("[boot] schema init threw:", e));
