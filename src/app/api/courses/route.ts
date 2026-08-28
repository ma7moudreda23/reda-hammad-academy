import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { PLATFORM_URL } from "@/lib/site";
import { csrfGuard } from "@/lib/request-guard";
import { CACHE_TAGS } from "@/lib/cache";

export async function GET() {
  // Admin-only: this returns unpublished/draft courses too.
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const courses = await prisma.course.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ courses }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  }

  let slug = body.slug ? slugify(body.slug) : slugify(body.title);
  // ensure uniqueness
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const course = await prisma.course.create({
    data: {
      slug,
      title: body.title,
      description: body.description ?? "",
      longDescription: body.longDescription ?? "",
      curriculum:
        typeof body.curriculum === "string"
          ? body.curriculum
          : JSON.stringify(body.curriculum ?? []),
      features:
        typeof body.features === "string"
          ? body.features
          : JSON.stringify(body.features ?? []),
      imageUrl: body.imageUrl ?? "",
      price: body.price ?? "",
      oldPrice: body.oldPrice ?? "",
      priceNote: body.priceNote ?? "",
      currency: body.currency ?? "ريال سعودي",
      badge: body.badge ?? "",
      category: body.category ?? "",
      startAt: typeof body.startAt === "string" ? body.startAt : "",
      registrationOpen: body.registrationOpen ?? false,
      detailsImageUrl: body.detailsImageUrl ?? "",
      paymentNote: body.paymentNote ?? "",
      showElectronicPayment: body.showElectronicPayment ?? true,
      showBankTransfer: body.showBankTransfer ?? false,
      paymentBanks: body.paymentBanks ?? "all",
      platformUrl: body.platformUrl || PLATFORM_URL,
      isPublished: body.isPublished ?? true,
      isFeatured: body.isFeatured ?? false,
      sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
    },
  });

  revalidateTag(CACHE_TAGS.courses, "max");
  return NextResponse.json({ course }, { status: 201 });
}
