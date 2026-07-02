import { NextResponse } from "next/server";

import {
  addEntry,
  listEntries,
  isImage,
  MAX_UPLOAD_BYTES,
} from "@/app/lib/guestbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/guestbook — enregistre une signature (nom, commentaire, photo). */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const comment = String(form.get("comment") ?? "").trim();
  const photo = form.get("photo");

  if (!comment) {
    return NextResponse.json(
      { error: "Le message est obligatoire." },
      { status: 400 },
    );
  }
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json(
      { error: "Une photo est obligatoire." },
      { status: 400 },
    );
  }
  if (!isImage(photo.type)) {
    return NextResponse.json(
      { error: "Le fichier doit être une image." },
      { status: 415 },
    );
  }
  if (photo.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde (8 Mo max)." },
      { status: 413 },
    );
  }

  try {
    const entry = await addEntry({
      name: name || "Un invité",
      comment,
      photo,
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("[guestbook] enregistrement échoué:", err);
    return NextResponse.json(
      { error: "Enregistrement impossible, réessayez." },
      { status: 500 },
    );
  }
}

/** GET /api/guestbook — liste les signatures (JSON). */
export async function GET() {
  try {
    return NextResponse.json({ entries: await listEntries() });
  } catch (err) {
    console.error("[guestbook] lecture échouée:", err);
    return NextResponse.json(
      { error: "Lecture impossible." },
      { status: 500 },
    );
  }
}
