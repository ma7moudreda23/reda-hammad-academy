import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: Number(session.sub) },
  });
  if (!admin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
    return NextResponse.json(
      { error: "كلمة المرور الحالية غير صحيحة" },
      { status: 400 },
    );
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
