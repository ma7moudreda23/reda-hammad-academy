import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serve an uploaded file stored in the DB. URL form: /api/file/<id>.<ext>
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string }> },
) {
  const { key } = await ctx.params;
  // key looks like "<token>.<ext>" (or legacy "<id>.<ext>"). Strip the extension.
  const base = key.replace(/\.[a-z0-9]+$/i, "");
  if (!base) return new Response("Not found", { status: 404 });

  try {
    let row = await prisma.upload.findUnique({ where: { token: base } });
    // Backward-compat: old links used the numeric id.
    if (!row && /^\d+$/.test(base)) {
      row = await prisma.upload.findUnique({ where: { id: Number(base) } });
    }
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
