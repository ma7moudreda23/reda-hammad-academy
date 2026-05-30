import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

async function guard() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  return null;
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await ctx.params;
  const courseId = Number(id);
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = slugify(body.slug);
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
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.badge !== undefined) data.badge = body.badge;
  if (body.category !== undefined) data.category = body.category;
  if (body.platformUrl !== undefined) data.platformUrl = body.platformUrl;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;
  if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;

  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data,
    });
    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "تعذّر التحديث" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await ctx.params;
  try {
    await prisma.course.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذّر الحذف" }, { status: 400 });
  }
}
