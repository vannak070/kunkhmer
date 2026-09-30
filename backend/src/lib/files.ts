/**
 * Pictures as files instead of base64 text in the database (claude/updates/images-as-files.md).
 * A body value that is exactly a base64 image data URI is written to UPLOAD_DIR under its content
 * hash and replaced by the link /api/files/<sha256>.<ext>. Same picture → same file.
 * PDFs are stored the same way, but only where a route asks for it (storePdfDataUri) — the
 * global hook converts pictures only.
 */
import { createHash } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../config.ts";
import { HttpError } from "./http.ts";

/** Allowed picture types and their file extensions. */
export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export const FILE_NAME = /^[a-f0-9]{64}\.(png|jpg|webp|gif|avif|svg|pdf)$/;
export const FILES_PATH = "/api/files/";
const MAX_BYTES = 10 * 1024 * 1024;
const DATA_URI = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;
const PDF_DATA_URI = /^data:application\/pdf;base64,([A-Za-z0-9+/=\s]+)$/i;

export const isImageDataUri = (v: unknown): v is string => typeof v === "string" && v.length < 30_000_000 && DATA_URI.test(v);
export const isPdfDataUri = (v: unknown): v is string => typeof v === "string" && v.length < 30_000_000 && PDF_DATA_URI.test(v);

/** Saves the bytes under their content hash (once) and returns the public link. */
async function saveFile(bytes: Buffer, ext: string): Promise<string> {
  const name = `${createHash("sha256").update(bytes).digest("hex")}.${ext}`;
  const path = join(config.uploadDir, name);
  const exists = await stat(path).then(() => true, () => false);
  if (!exists) {
    await mkdir(config.uploadDir, { recursive: true });
    await writeFile(path, bytes);
  }
  return FILES_PATH + name;
}

/** Writes one data URI to disk (if not there yet) and returns its public link. */
export async function storeDataUri(uri: string): Promise<string> {
  const m = uri.match(DATA_URI);
  if (!m) throw new HttpError(422, "Invalid image data");
  const ext = IMAGE_TYPES[m[1].toLowerCase()];
  if (!ext) throw new HttpError(422, "Unsupported image type (use PNG, JPEG, WebP, GIF, AVIF or SVG)");
  const bytes = Buffer.from(m[2].replace(/\s+/g, ""), "base64");
  if (bytes.length === 0) throw new HttpError(422, "Invalid image data");
  if (bytes.length > MAX_BYTES) throw new HttpError(422, "Images must be at most 10 MB");
  return saveFile(bytes, ext);
}

/** Writes one base64 PDF data URI to disk (if not there yet) and returns its public link. */
export async function storePdfDataUri(uri: string): Promise<string> {
  const m = uri.match(PDF_DATA_URI);
  if (!m) throw new HttpError(422, "Documents must be PDF files");
  const bytes = Buffer.from(m[1].replace(/\s+/g, ""), "base64");
  // Check the file really is a PDF, not just labelled as one.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") throw new HttpError(422, "Documents must be PDF files");
  if (bytes.length > MAX_BYTES) throw new HttpError(422, "Documents must be at most 10 MB");
  return saveFile(bytes, "pdf");
}

// ─── Private documents (ID / medical scans) ─────────────────────────────────
// Kept in UPLOAD_DIR/private, which the public /api/files route can't reach (it only reads names in the
// top folder). The database holds the file name; a staff-only route streams the file.
// claude/features/fighter-personal-records.md

/** Allowed private document types: PDF and common photo formats (no SVG). */
const PRIVATE_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "application/pdf": "pdf" };
const PRIVATE_DATA_URI = /^data:((?:image|application)\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;

export const isPrivateDataUri = (v: unknown): v is string => typeof v === "string" && v.length < 30_000_000 && PRIVATE_DATA_URI.test(v);
export const privateDir = () => join(config.uploadDir, "private");

/** Stores a base64 PDF or photo privately and returns its file name (not a URL). */
export async function storePrivateDocument(uri: string): Promise<string> {
  const m = uri.match(PRIVATE_DATA_URI);
  const ext = m && PRIVATE_TYPES[m[1].toLowerCase()];
  if (!m || !ext) throw new HttpError(422, "Documents must be a PDF or a PNG, JPEG or WebP picture");
  const bytes = Buffer.from(m[2].replace(/\s+/g, ""), "base64");
  if (bytes.length === 0) throw new HttpError(422, "Invalid document data");
  if (bytes.length > MAX_BYTES) throw new HttpError(422, "Documents must be at most 10 MB");
  if (ext === "pdf" && bytes.subarray(0, 5).toString("latin1") !== "%PDF-") throw new HttpError(422, "Documents must be PDF files");
  const name = `${createHash("sha256").update(bytes).digest("hex")}.${ext}`;
  const path = join(privateDir(), name);
  if (!(await stat(path).then(() => true, () => false))) {
    await mkdir(privateDir(), { recursive: true });
    await writeFile(path, bytes);
  }
  return name;
}

/** Returns the body with every base64 image data URI (at any depth) replaced by a stored file link. */
export async function replaceInlineImages<T>(value: T, depth = 0): Promise<T> {
  if (isImageDataUri(value)) return (await storeDataUri(value)) as T;
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return (await Promise.all(value.map((v) => replaceInlineImages(v, depth + 1)))) as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = await replaceInlineImages(v, depth + 1);
  return out as T;
}
