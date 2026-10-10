/**
 * Shrinks photos in the browser before they are uploaded or saved.
 * A 3–6 MB phone photo becomes ~80–250 KB at 1600 px (WebP, JPEG fallback).
 */

export interface CompressOptions {
  /** Longest side in pixels (default 1600). */
  maxDimension?: number;
  /** 0–1 encoder quality (default 0.8). */
  quality?: number;
}

const SKIP_BELOW_BYTES = 150 * 1024;
let webpSupported: boolean | null = null;

function supportsWebp(): boolean {
  if (webpSupported === null) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpSupported;
}

function isCompressible(file: File): boolean {
  return file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // respects the EXIF orientation of phone photos
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall back to <img> decoding (older Safari)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function toBlob(file: File, { maxDimension = 1600, quality = 0.8 }: CompressOptions): Promise<Blob | null> {
  const source = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();
  const type = supportsWebp() ? "image/webp" : "image/jpeg";
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Smaller WebP/JPEG copy of an image file, or the original if it can't be improved. Never throws. */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  if (!isCompressible(file) || file.size <= SKIP_BELOW_BYTES) return file;
  try {
    const blob = await toBlob(file, options);
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}

/** File extension matching a (possibly compressed) file's type. */
export function extensionFor(file: File): string {
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  return (file.name.split(".").pop() || "jpg").toLowerCase();
}

/** Compressed image as a data: URL, for screens that keep the picture inline instead of uploading it. */
export async function fileToCompressedDataUrl(file: File, options: CompressOptions = {}): Promise<string> {
  const small = await compressImage(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(small);
  });
}
