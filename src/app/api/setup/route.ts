import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  ensureDatabase,
  normalizeCourseSlugs,
  ensureMawhibaCurriculum,
} from "@/lib/init-db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Side-effecting maintenance endpoint: creates tables, seeds, fixes slugs, and
// (with ?force=) re-applies the curriculum template. Protected — an admin
// session, or a ?token= matching SETUP_TOKEN (for the first run before any
// admin exists).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const setupToken = process.env.SETUP_TOKEN ?? "";
  const tokenOk =
    setupToken.length > 0 && safeEqual(url.searchParams.get("token") ?? "", setupToken);
  const authorized = tokenOk || (await getSession()) !== null;
  if (!authorized) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const force = (url.searchParams.get("force") ?? "")
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
    console.error("setup error", e);
    return NextResponse.json(
      { ok: false, message: "unexpected error" },
      { status: 500 },
    );
  }
}
