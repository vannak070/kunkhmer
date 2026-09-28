/**
 * Pictures as files instead of base64 text in the database (claude/updates/images-as-files.md).
 * A body value that is exactly a base64 image data URI is written to UPLOAD_DIR under its content
 * hash and replaced by the link /api/files/<sha256>.<ext>. Same picture → same file.
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
};

export const FILE_NAME = /^[a-f0-9]{64}\.(png|jpg|webp|gif|avif|svg)$/;
export const FILES_PATH = "/api/files/";
const MAX_BYTES = 10 * 1024 * 1024;
const DATA_URI = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;

export const isImageDataUri = (v: unknown): v is string => typeof v === "string" && v.length < 30_000_000 && DATA_URI.test(v);

/** Writes one data URI to disk (if not there yet) and returns its public link. */
export async function storeDataUri(uri: string): Promise<string> {
  const m = uri.match(DATA_URI);
  if (!m) throw new HttpError(422, "Invalid image data");
  const ext = IMAGE_TYPES[m[1].toLowerCase()];
  if (!ext) throw new HttpError(422, "Unsupported image type (use PNG, JPEG, WebP, GIF, AVIF or SVG)");
  const bytes = Buffer.from(m[2].replace(/\s+/g, ""), "base64");
  if (bytes.length === 0) throw new HttpError(422, "Invalid image data");
  if (bytes.length > MAX_BYTES) throw new HttpError(422, "Images must be at most 10 MB");
  const name = `${createHash("sha256").update(bytes).digest("hex")}.${ext}`;
  const path = join(config.uploadDir, name);
  const exists = await stat(path).then(() => true, () => false);
  if (!exists) {
    await mkdir(config.uploadDir, { recursive: true });
    await writeFile(path, bytes);
  }
  return FILES_PATH + name;
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
