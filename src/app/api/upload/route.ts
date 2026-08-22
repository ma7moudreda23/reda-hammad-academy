import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { csrfGuard, createRateLimiter, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

const allow = createRateLimiter({ windowMs: 60 * 1000, max: 30 });

// Verify the file's real bytes match the declared type (defence against a
// spoofed Content-Type). Returns true if the magic bytes look right.
function magicOk(type: string, b: Uint8Array): boolean {
  const s = (sig: number[], off = 0) => sig.every((v, i) => b[off + i] === v);
  switch (type) {
    case "image/jpeg": return s([0xff, 0xd8, 0xff]);
    case "image/png": return s([0x89, 0x50, 0x4e, 0x47]);
    case "image/gif": return s([0x47, 0x49, 0x46, 0x38]);
    case "image/webp": return s([0x52, 0x49, 0x46, 0x46]) && s([0x57, 0x45, 0x42, 0x50], 8);
    case "image/avif": return s([0x66, 0x74, 0x79, 0x70], 4);
    case "application/pdf": return s([0x25, 0x50, 0x44, 0x46]);
    case "video/mp4": return s([0x66, 0x74, 0x79, 0x70], 4);
    case "video/webm": return s([0x1a, 0x45, 0xdf, 0xa3]);
    case "image/svg+xml": {
      const head = new TextDecoder().decode(b.slice(0, 512)).trimStart().toLowerCase();
      return head.startsWith("<?xml") || head.startsWith("<svg") || head.startsWith("<!--");
    }
    default: return false;
  }
}

// Stored inside the DB (survives redeploys), so keep within MySQL packet limits.
const MAX_BYTES = 30 * 1024 * 1024; // 30MB — plenty for images/PDFs
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "image/svg+xml",
]);

function extFromType(type: string) {
  return (
    {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "application/pdf": "pdf",
      "image/svg+xml": "svg",
    }[type] ?? "bin"
  );
}

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }
  if (!allow(clientIp(request))) {
    return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقًا." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "نوع الملف غير مدعوم (صور أو فيديو أو PDF)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "حجم الملف كبير جدًا (الحد 30 ميجابايت). للفيديوهات استخدم رابط YouTube." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!magicOk(file.type, buffer)) {
    return NextResponse.json(
      { error: "محتوى الملف لا يطابق نوعه المعلن." },
      { status: 400 },
    );
  }
  try {
    // Random, unguessable id so files can't be enumerated (e.g. /api/file/4,5,6).
    const token = randomBytes(24).toString("base64url");
    await prisma.upload.create({
      data: { token, mime: file.type, data: buffer },
      select: { id: true },
    });
    // Extension in the URL lets the UI detect image/video/pdf for previews.
    return NextResponse.json({ url: `/api/file/${token}.${extFromType(file.type)}` });
  } catch (e) {
    console.error("upload: DB store failed", e);
    return NextResponse.json({ error: "تعذّر حفظ الملف" }, { status: 500 });
  }
}
