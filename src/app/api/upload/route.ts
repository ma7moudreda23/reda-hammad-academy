import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

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
  if (!(await getSession())) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
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
