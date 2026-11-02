import sharp from "sharp";
import { randomUUID } from "crypto";

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

/**
 * Sinh tên file duy nhất cho ảnh tải lên.
 * Dùng crypto.randomUUID() của Node để không phụ thuộc package ESM (`uuid`),
 * tránh lỗi require/ESM khi chạy route handler ở các môi trường khác nhau.
 */
export function generateImageFileName(_originalName?: string): string {
  return `${randomUUID()}.webp`;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
