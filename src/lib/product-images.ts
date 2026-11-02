export const MAX_PRODUCT_IMAGES = 10;

/** Chấp nhận ảnh nội bộ (`/uploads/...`) hoặc URL https công khai. */
export function isValidProductImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const url = value.trim();
  if (!url || url.length > 700) return false;
  if (url.startsWith("/uploads/")) return url.length > "/uploads/".length;
  return /^https:\/\/[^\s]+$/i.test(url);
}

/**
 * Chuẩn hoá danh sách ảnh của sản phẩm.
 * - Ảnh đầu tiên là ảnh chính.
 * - Loại ảnh trùng, giới hạn số lượng.
 * - Nếu danh sách rỗng nhưng còn `imageUrl` cũ thì dùng `imageUrl` làm ảnh chính
 *   (tương thích dữ liệu trước khi có nhiều ảnh).
 */
export function normalizeProductImages(
  rawImages: unknown,
  legacyImageUrl: unknown
): string[] {
  const result: string[] = [];
  const push = (value: unknown) => {
    if (!isValidProductImageUrl(value)) return;
    const url = value.trim();
    if (result.includes(url)) return;
    result.push(url);
  };

  if (Array.isArray(rawImages)) {
    rawImages.forEach(push);
  }
  push(legacyImageUrl);

  return result.slice(0, MAX_PRODUCT_IMAGES);
}
