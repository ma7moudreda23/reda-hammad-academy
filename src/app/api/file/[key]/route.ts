import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serve an uploaded file stored in the DB. URL form: /api/file/<id>.<ext>
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  const { key } = await ctx.params;
  const id = parseInt(key, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const row = await prisma.upload.findUnique({ where: { id } });
    if (!row) return new Response("Not found", { status: 404 });
    return new Response(Buffer.from(row.data as unknown as Uint8Array), {
      headers: {
        "Content-Type": row.mime || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        // Stop a stored SVG/HTML upload from running scripts if opened directly,
        // and stop MIME sniffing.
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    console.error("file serve failed", e);
    return new Response("Server error", { status: 500 });
  }
}
