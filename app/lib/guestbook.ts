import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

/* -------------------------------------------------------------------------
   Livre d'or.
   - Métadonnées (date, lien du fichier, nom, commentaire) → PostgreSQL via Prisma.
   - Images → répertoire du volume disque (DATA_DIR/uploads), renommées.
   Le schéma de la table est géré par les migrations Prisma (prisma/migrations),
   pas créé à la volée. Connexion : variable DATABASE_URL.
--------------------------------------------------------------------------- */

/* ---------- répertoire des uploads (volume) ----------
   On force un chemin ABSOLU : si DATA_DIR est relatif (ex. mauvaise variable
   Railway), on évite d'écrire au hasard dans le conteneur au lieu du volume. */
export const DATA_DIR = path.resolve(
  process.env.DATA_DIR || path.join(process.cwd(), "data"),
);
export const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(DATA_DIR, "uploads"),
);

// visible dans les logs Railway pour vérifier où atterrissent les images
console.log(`[guestbook] dossier des images : ${UPLOADS_DIR}`);

/* ---------- limites ---------- */
export const MAX_UPLOAD_BYTES =
  (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/avif": ".avif",
};

export type GuestbookEntry = {
  id: number;
  name: string;
  comment: string;
  /** lien public vers l'image (route qui sert le fichier du volume) */
  file: string;
  /** date ISO 8601 UTC */
  created_at: string;
};

/* ---------- client Prisma (singleton, résiste au hot-reload de dev) ---------- */
const g = globalThis as unknown as { __prisma?: PrismaClient };
export const prisma = g.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;

/* ---------- helpers fichiers ---------- */
export function isImage(type: string): boolean {
  return type.startsWith("image/");
}

/** Renomme le fichier de façon sûre et unique avant l'enregistrement. */
export function buildFileName(originalName: string, mime: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  const ext =
    (/^\.[a-z0-9]{1,5}$/.test(fromName) ? fromName : "") ||
    EXT_BY_MIME[mime] ||
    ".jpg";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomBytes(6).toString("hex");
  return `${stamp}_${rand}${ext}`;
}

/**
 * Enregistre une image (renommée) dans le volume puis crée l'entrée en base.
 */
export async function addEntry(input: {
  name: string;
  comment: string;
  photo: File;
}): Promise<GuestbookEntry> {
  const { name, comment, photo } = input;

  if (!isImage(photo.type)) throw new Error("INVALID_TYPE");
  const bytes = Buffer.from(await photo.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error("EMPTY_FILE");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const fileName = buildFileName(photo.name || "photo", photo.type);
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), bytes);

  const file = `/api/guestbook/photo/${fileName}`;
  try {
    const row = await prisma.guestbookEntry.create({
      data: { name, comment, file },
    });
    return {
      id: row.id,
      name: row.name,
      comment: row.comment,
      file: row.file,
      created_at: row.createdAt.toISOString(),
    };
  } catch (err) {
    // en cas d'échec base, on retire l'image orpheline
    fs.rmSync(path.join(UPLOADS_DIR, fileName), { force: true });
    throw err;
  }
}

/** Liste les signatures, de la plus récente à la plus ancienne. */
export async function listEntries(): Promise<GuestbookEntry[]> {
  const rows = await prisma.guestbookEntry.findMany({
    orderBy: { id: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    comment: r.comment,
    file: r.file,
    created_at: r.createdAt.toISOString(),
  }));
}

/**
 * Résout un nom de fichier d'upload en chemin absolu sûr (empêche tout
 * échappement de répertoire type ../). Retourne null si invalide/inexistant.
 */
export function resolveUploadPath(fileName: string): string | null {
  const base = path.basename(fileName);
  if (!base || base !== fileName) return null;
  const abs = path.join(UPLOADS_DIR, base);
  if (!abs.startsWith(UPLOADS_DIR + path.sep)) return null;
  return fs.existsSync(abs) ? abs : null;
}
