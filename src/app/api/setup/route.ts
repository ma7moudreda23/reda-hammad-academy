import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  ensureDatabase,
  normalizeCourseSlugs,
  ensureMawhibaCurriculum,
} from "@/lib/init-db";
import { getSession } from "@/lib/auth";
import { csrfGuard } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function authorize(req: Request): Promise<boolean> {
  const setupToken = process.env.SETUP_TOKEN ?? "";
  const url = new URL(req.url);
  const headerToken = req.headers.get("x-setup-token") ?? url.searchParams.get("token") ?? "";
  const tokenOk = setupToken.length > 0 && safeEqual(headerToken, setupToken);
  return tokenOk || (await getSession()) !== null;
}

async function runSetup(req: Request) {
  const url = new URL(req.url);
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
}

// State-changing maintenance endpoint — POST only, same-origin only, and
// requires an admin session or the SETUP_TOKEN. (A GET could be triggered via
// CSRF / prefetch; forcing POST + Origin check closes that.)
export async function POST(req: Request) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  if (!(await authorize(req))) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  try {
    return await runSetup(req);
  } catch (e) {
    console.error("setup error", e);
    return NextResponse.json({ ok: false, message: "unexpected error" }, { status: 500 });
  }
}

// A safe GET so an authorized admin can still trigger it from the browser bar,
// but ONLY with a valid SETUP_TOKEN (not via ambient session) — a token in the
// URL can't be supplied by a CSRF attacker, and read-only prefetch of a bare
// /api/setup does nothing.
export async function GET(req: Request) {
  const setupToken = process.env.SETUP_TOKEN ?? "";
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (!(setupToken.length > 0 && safeEqual(token, setupToken))) {
    return NextResponse.json(
      { error: "استخدم POST من لوحة التحكم، أو GET مع ?token=SETUP_TOKEN" },
      { status: 401 },
    );
  }
  try {
    return await runSetup(req);
  } catch (e) {
    console.error("setup error", e);
    return NextResponse.json({ ok: false, message: "unexpected error" }, { status: 500 });
  }
}
