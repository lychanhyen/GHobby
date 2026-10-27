import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // Auto rotate based on EXIF
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}

export function generateImageFileName(originalName: string): string {
  const ext = ".webp";
  return `${uuidv4()}${ext}`;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
