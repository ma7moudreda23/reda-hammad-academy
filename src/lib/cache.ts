// Central cache tags + revalidation window for the site's DB-backed data.
//
// Read functions wrap their DB query in `unstable_cache` tagged with one of
// these tags, so the DB is hit only on a cache miss or when the window elapses.
// Admin save routes call `revalidateTag(...)` to refresh instantly on edit.
//
// The `revalidate` window is a safety net: even if an on-demand revalidation is
// ever missed, the data self-heals within this many seconds.
export const CACHE_TAGS = {
  home: "site-home",
  payment: "site-payment",
  courses: "site-courses",
} as const;

export const CONTENT_REVALIDATE_SECONDS = 300;
