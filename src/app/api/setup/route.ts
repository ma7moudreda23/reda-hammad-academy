import { NextResponse } from "next/server";
import { ensureDatabase, normalizeCourseSlugs, ensureMawhibaCurriculum } from "@/lib/init-db";

export const dynamic = "force-dynamic";

// Visit once after deploy to create the DB tables + seed admin/courses, and
// fix any non-ASCII (Arabic) course slugs. Safe to call repeatedly (idempotent).
export async function GET(req: Request) {
  try {
    // Optional: /api/setup?force=mawhiba-level-1  (or "all") to re-apply the
    // default curriculum template, overwriting that course's current sections.
    const force = (new URL(req.url).searchParams.get("force") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const result = await ensureDatabase();
    const slugs = await normalizeCourseSlugs();
    const curriculum = await ensureMawhibaCurriculum(force);
    return NextResponse.json(
      { ...result, slugsFixed: slugs.fixed, curriculumUpdated: curriculum.updated },
      { status: result.ok ? 200 : 500 },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "unexpected error: " + String(e) },
      { status: 500 },
    );
  }
}
