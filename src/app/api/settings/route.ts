import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { getHomeContent, saveHomeContent, DEFAULT_HOME } from "@/lib/content";
import { csrfGuard } from "@/lib/request-guard";
import { CACHE_TAGS } from "@/lib/cache";

export async function GET() {
  const content = await getHomeContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.content) {
    return NextResponse.json({ error: "محتوى غير صالح" }, { status: 400 });
  }

  // Merge over defaults to guarantee a complete, valid shape.
  const merged = { ...DEFAULT_HOME, ...body.content };
  await saveHomeContent(merged);
  // Refresh the cached home content (and the ticker in the shared layout) now.
  revalidateTag(CACHE_TAGS.home, "max");
  return NextResponse.json({ ok: true, content: merged });
}
