import { processImage, generateImageFileName } from "./image-processor";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  storeImage,
} from "./upload-storage";

export interface UploadedImageResult {
  url: string;
  path: string;
  name: string;
}

export interface UploadFailure {
  name: string;
  message: string;
}

/** Nhận dạng ảnh bằng magic bytes để bù trường hợp trình duyệt không gửi MIME type. */
function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Xử lý + lưu một loạt ảnh tải lên.
 * Không ném lỗi cho từng file: file lỗi được trả về trong `failures` để route
 * phản hồi thông báo rõ ràng cho người dùng thay vì 500 chung chung.
 */
export async function handleUploadedImages(
  files: File[],
  maxCount: number
): Promise<{ uploaded: UploadedImageResult[]; failures: UploadFailure[] }> {
  const uploaded: UploadedImageResult[] = [];
  const failures: UploadFailure[] = [];

  for (const file of files.slice(0, maxCount)) {
    const name = file?.name || "ảnh";

    if (!file || typeof file.arrayBuffer !== "function") {
      failures.push({ name, message: "File không hợp lệ" });
      continue;
    }

    if (file.size <= 0) {
      failures.push({ name, message: "File rỗng" });
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      failures.push({
        name,
        message: `Ảnh vượt quá ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB`,
      });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(buffer);
    const mime = ALLOWED_IMAGE_MIME_TYPES.includes(file.type)
      ? file.type
      : detectedMime || file.type;

    if (!mime || !ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
      failures.push({
        name,
        message: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP (ảnh HEIC/AVIF từ điện thoại cần đổi định dạng)",
      });
      continue;
    }

    try {
      const processed = await processImage(buffer);
      const fileName = generateImageFileName(file.name);
      const stored = await storeImage(processed, fileName, "image/webp");
      uploaded.push({ url: stored.url, path: fileName, name: file.name });
    } catch (error: any) {
      console.error(`[upload] Xử lý ảnh "${name}" thất bại:`, error);
      const rawMessage = String(error?.message || "");
      const isInvalidImage =
        /unsupported image format|Input (file|buffer)|corrupt|premature end|VipsForeignLoad/i.test(
          rawMessage
        );
      failures.push({
        name,
        message: isInvalidImage
          ? "File không phải ảnh hợp lệ hoặc ảnh bị lỗi. Vui lòng chọn ảnh JPG/PNG/WebP khác."
          : "Không xử lý được ảnh này. Vui lòng thử ảnh khác.",
      });
    }
  }

  return { uploaded, failures };
}
