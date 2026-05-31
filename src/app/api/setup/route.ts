import { NextResponse } from "next/server";
import { ensureDatabase } from "@/lib/init-db";

export const dynamic = "force-dynamic";

// Visit once after deploy to create the DB tables + seed admin/courses.
// Safe to call multiple times (idempotent).
export async function GET() {
  try {
    const result = await ensureDatabase();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "unexpected error: " + String(e) },
      { status: 500 },
    );
  }
}
