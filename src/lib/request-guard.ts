import "server-only";

/**
 * CSRF defence-in-depth for state-changing requests.
 *
 * The session cookie is SameSite=Lax, which already blocks cross-site POST/PUT/
 * DELETE. This adds a second, independent check so a single mistake (a cookie
 * flag change, a browser quirk, a state-changing GET) can't reopen CSRF:
 * the request must originate from this site.
 *
 * Uses Origin when present, falling back to Sec-Fetch-Site (sent by all modern
 * browsers). Non-browser callers (no Origin, no Sec-Fetch-Site) are allowed so
 * server-to-server/CLI use keeps working — those carry no ambient cookie.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";

  const origin = request.headers.get("origin");
  if (!origin) return true; // not a browser-initiated cross-site request

  try {
    const host = request.headers.get("host");
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Rejects cross-site state-changing requests. Returns null when allowed. */
export function csrfGuard(request: Request): Response | null {
  if (isSameOrigin(request)) return null;
  return Response.json({ error: "طلب غير مصرّح به" }, { status: 403 });
}

/**
 * Small fixed-capacity, per-process rate limiter.
 * Bounded so a flood of unique keys can't grow memory without limit.
 */
export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  capacity?: number;
}) {
  const { windowMs, max, capacity = 5000 } = opts;
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function allow(key: string): boolean {
    const now = Date.now();
    const rec = hits.get(key);

    if (!rec || now > rec.resetAt) {
      if (hits.size >= capacity) {
        for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
        if (hits.size >= capacity) hits.clear();
      }
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    rec.count += 1;
    return rec.count <= max;
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
