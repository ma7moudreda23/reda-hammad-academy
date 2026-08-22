import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";
import { csrfGuard, createRateLimiter, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

const allow = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 8 });

// A constant bcrypt hash of a random value, compared when the email is unknown
// so response timing doesn't reveal whether an account exists.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8p9q1mP0dJk7Xy0rXbE3sJ0z7uWq2";

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  if (!allow(clientIp(request))) {
    return NextResponse.json(
      { error: "محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "أدخل البريد الإلكتروني وكلمة المرور" },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  // Always run a hash comparison to keep timing uniform (user-enumeration).
  const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 },
    );
  }

  const token = await createSessionToken({
    sub: String(admin.id),
    email: admin.email,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
