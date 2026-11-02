import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";
import { supabaseAdmin } from "./supabase";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_PRODUCT = 10;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export type ImageStorageDriver = "supabase" | "local" | "database";

/**
 * Kiểm tra Supabase Storage đã được cấu hình THẬT hay chưa.
 * Service role key phải là JWT (`eyJ...`) hoặc secret key mới (`sb_secret_...`),
 * placeholder trong .env (ví dụ "DÁN_ANON_KEY...") sẽ bị coi là chưa cấu hình.
 */
export function isSupabaseStorageConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return Boolean(
    url.startsWith("http") && (key.startsWith("eyJ") || key.startsWith("sb_secret_"))
  );
}

/** Đường dẫn URL công khai luôn có cùng dạng, bất kể ảnh được lưu ở đâu. */
export function buildUploadUrl(fileName: string): string {
  return `${UPLOAD_URL_PREFIX}${fileName}`;
}

export function getImageMimeFromFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/webp";
}

/** Chặn path traversal: chỉ cho phép tên file phẳng, không thư mục. */
export function sanitizeUploadFileName(raw: string): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  const base = path.basename(decoded);
  if (!base || base !== decoded) return null;
  if (base.includes("..") || base.startsWith(".")) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return null;
  return base;
}

async function saveToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  const bucket = "product-images";
  const { error } = await supabaseAdmin.storage.from(bucket).upload(fileName, buffer, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  return `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
}

async function saveToLocalDisk(buffer: Buffer, fileName: string): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);
}

async function saveToDatabase(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<void> {
  await prisma.uploadedImage.upsert({
    where: { fileName },
    update: { data: buffer, size: buffer.byteLength, mimeType },
    create: {
      fileName,
      mimeType,
      size: buffer.byteLength,
      data: buffer,
    },
  });
}

/**
 * Lưu ảnh vào nơi bền vững nhất có thể:
 * 1. Supabase Storage (nếu đã cấu hình key thật) — dùng cho production.
 * 2. Ghi đĩa `public/uploads` — nhanh, phục vụ trực tiếp ở local/dev.
 * 3. Ghi bảng `UploadedImage` trong Postgres — hoạt động cả khi filesystem chỉ đọc
 *    (Vercel/serverless) và ảnh vẫn còn sau khi deploy lại.
 *
 * Luôn trả về URL dạng `/uploads/<file>` để dữ liệu cũ không bị ảnh hưởng.
 */
export async function storeImage(
  buffer: Buffer,
  fileName: string,
  mimeType = "image/webp"
): Promise<{ url: string; driver: ImageStorageDriver }> {
  if (isSupabaseStorageConfigured()) {
    try {
      const url = await saveToSupabase(buffer, fileName);
      return { url, driver: "supabase" };
    } catch (error) {
      console.error("[upload] Supabase Storage lỗi, chuyển sang lưu nội bộ:", error);
    }
  }

  const savedDrivers: ImageStorageDriver[] = [];

  try {
    await saveToLocalDisk(buffer, fileName);
    savedDrivers.push("local");
  } catch (error) {
    console.error("[upload] Không ghi được file vào public/uploads:", error);
  }

  // Ghi DB để ảnh không bị mất khi deploy/khởi động lại máy chủ.
  try {
    await saveToDatabase(buffer, fileName, mimeType);
    savedDrivers.push("database");
  } catch (error) {
    console.error("[upload] Không ghi được ảnh vào database:", error);
  }

  if (savedDrivers.length === 0) {
    throw new Error(
      "Máy chủ chưa lưu được ảnh. Hãy kiểm tra quyền ghi thư mục public/uploads hoặc kết nối database."
    );
  }

  return { url: buildUploadUrl(fileName), driver: savedDrivers[0] };
}

/** Đọc ảnh đã tải lên từ đĩa hoặc database (dùng cho route /uploads/[...path]). */
export async function readStoredImage(
  fileName: string
): Promise<{ data: Buffer; mimeType: string } | null> {
  try {
    const data = await readFile(path.join(UPLOAD_DIR, fileName));
    return { data, mimeType: getImageMimeFromFileName(fileName) };
  } catch {
    // Không có trên đĩa -> thử database (trường hợp serverless/read-only FS).
  }

  try {
    const record = await prisma.uploadedImage.findUnique({ where: { fileName } });
    if (!record) return null;
    return {
      data: Buffer.from(record.data),
      mimeType: record.mimeType || getImageMimeFromFileName(fileName),
    };
  } catch (error) {
    console.error("[upload] Lỗi đọc ảnh từ database:", error);
    return null;
  }
}
