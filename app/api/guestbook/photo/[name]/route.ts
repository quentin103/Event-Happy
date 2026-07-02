import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

import { resolveUploadPath } from "@/app/lib/guestbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".avif": "image/avif",
};

/** GET /api/guestbook/photo/<name> — sert une image du volume. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const abs = resolveUploadPath(name);
  if (!abs) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const ext = path.extname(abs).toLowerCase();
  const file = fs.readFileSync(abs);
  const body = new Uint8Array(file);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
