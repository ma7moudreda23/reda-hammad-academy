import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkPromoCode } from "@/lib/promo";

// Admin-only and uncached: tells the course form why a code does or doesn't work.
export async function GET(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
  return NextResponse.json(await checkPromoCode(code, process.env.STRIPE_PROMO_KEY), {
    headers: { "Cache-Control": "no-store" },
  });
}
