import { Product } from "@/types/product";

const MAX_QUANTITY_PER_PRODUCT = 3;

/**
 * Số lượng tối đa có thể đặt cho một sản phẩm:
 * - IN_STOCK: không vượt tồn kho và tối đa 3 hộp.
 * - PRE_ORDER: không vượt số suất còn lại (preOrderLimit - preOrderCount)
 *   khi có cấu hình giới hạn, ngược lại tối đa 3.
 */
export function getProductCartLimit(product: Product): number {
  if (product.productType === "PRE_ORDER") {
    const preOrderLimit = product.preOrderLimit ?? 0;
    const preOrderCount = product.preOrderCount ?? 0;
    const remaining =
      preOrderLimit > 0 ? preOrderLimit - preOrderCount : MAX_QUANTITY_PER_PRODUCT;

    return Math.max(0, Math.min(MAX_QUANTITY_PER_PRODUCT, remaining));
  }

  return Math.max(0, Math.min(MAX_QUANTITY_PER_PRODUCT, product.stockQuantity));
}
