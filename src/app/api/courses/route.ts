import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { PLATFORM_URL } from "@/lib/site";

export async function GET() {
  // Admin-only: this returns unpublished/draft courses too.
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  const courses = await prisma.course.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
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
      currency: body.currency ?? "ريال سعودي",
      badge: body.badge ?? "",
      category: body.category ?? "",
      paymentNote: body.paymentNote ?? "",
      showBankTransfer: body.showBankTransfer ?? false,
      paymentBanks: body.paymentBanks ?? "all",
      platformUrl: body.platformUrl || PLATFORM_URL,
      isPublished: body.isPublished ?? true,
      isFeatured: body.isFeatured ?? false,
      sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}
