import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { csrfGuard } from "@/lib/request-guard";
import { CACHE_TAGS } from "@/lib/cache";

async function guard(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  return null;
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await ctx.params;
  const courseId = Number(id);
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) {
    const source = String(body.slug).trim() || String(body.title ?? "").trim();
    if (source) data.slug = slugify(source);
  }
  if (body.description !== undefined) data.description = body.description;
  if (body.longDescription !== undefined)
    data.longDescription = body.longDescription;
  if (body.curriculum !== undefined)
    data.curriculum =
      typeof body.curriculum === "string"
        ? body.curriculum
        : JSON.stringify(body.curriculum);
  if (body.features !== undefined)
    data.features =
      typeof body.features === "string"
        ? body.features
        : JSON.stringify(body.features);
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
  if (body.price !== undefined) data.price = body.price;
  if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice;
  if (body.priceNote !== undefined) data.priceNote = body.priceNote;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.badge !== undefined) data.badge = body.badge;
  if (body.category !== undefined) data.category = body.category;
  if (body.startAt !== undefined) data.startAt = body.startAt;
  if (body.registrationOpen !== undefined) data.registrationOpen = body.registrationOpen;
  if (body.showRegistrationGuide !== undefined) data.showRegistrationGuide = body.showRegistrationGuide;
  if (body.detailsImageUrl !== undefined) data.detailsImageUrl = body.detailsImageUrl;
  if (body.paymentNote !== undefined) data.paymentNote = body.paymentNote;
  if (body.showElectronicPayment !== undefined) data.showElectronicPayment = body.showElectronicPayment;
  if (body.showBankTransfer !== undefined) data.showBankTransfer = body.showBankTransfer;
  if (body.paymentBanks !== undefined) data.paymentBanks = body.paymentBanks;
  if (body.platformUrl !== undefined) data.platformUrl = body.platformUrl;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;

  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data,
    });
    revalidateTag(CACHE_TAGS.courses, "max");
    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "تعذّر التحديث" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    await prisma.course.delete({ where: { id: Number(id) } });
    revalidateTag(CACHE_TAGS.courses, "max");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّر الحذف" }, { status: 400 });
  }
}
