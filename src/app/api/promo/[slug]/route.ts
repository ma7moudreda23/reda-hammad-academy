import { NextResponse } from "next/server";
import { getCourseBySlug } from "@/lib/courses";
import { getPromoStatus } from "@/lib/promo";

// Public: answers only for a course's own code, never for an arbitrary one.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const course = await getCourseBySlug(slug);
  const code = course?.isPublished ? course.promoCode.trim() : "";
  const status = code ? await getPromoStatus(code) : null;
  if (!status) return NextResponse.json({ error: "غير متاح" }, { status: 404 });
  return NextResponse.json(status, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
