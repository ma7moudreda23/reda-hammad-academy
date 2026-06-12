import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPaymentContent, savePaymentContent, DEFAULT_PAYMENT } from "@/lib/payment";

export const dynamic = "force-dynamic";

export async function GET() {
  // Admin-only: the public site reads bank accounts per-course (server-side),
  // so the full account list is never exposed through this endpoint.
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const content = await getPaymentContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
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
  return NextResponse.json({ ok: true, content: merged });
}
