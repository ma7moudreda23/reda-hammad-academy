import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";
import { getPaymentContent, savePaymentContent, DEFAULT_PAYMENT } from "@/lib/payment";
import { csrfGuard } from "@/lib/request-guard";
import { CACHE_TAGS } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  // Admin-only: the public site reads bank accounts per-course (server-side),
  // so the full account list is never exposed through this endpoint.
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const content = await getPaymentContent();
  return NextResponse.json({ content }, { headers: { "Cache-Control": "no-store" } });
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
  const c = body.content;
  const merged = {
    ...DEFAULT_PAYMENT,
    ...c,
    banks: Array.isArray(c.banks) ? c.banks : [],
  };
  await savePaymentContent(merged);
  revalidateTag(CACHE_TAGS.payment, "max");
  return NextResponse.json({ ok: true, content: merged });
}
