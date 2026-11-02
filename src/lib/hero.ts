import { HeroSlotConfig, Product } from "@/types/product";
import { normalizeHeroSlots } from "./settings";

export interface HeroSlotResolution {
  /** Sản phẩm được chọn cho ô này (null nếu ô đang dùng ảnh tải lên thủ công). */
  product: Product | null;
  /** Ảnh hiển thị cuối cùng cho ô. */
  image: string;
  /** true khi ô đang dùng ảnh hero tải lên thủ công. */
  usesCustomImage: boolean;
}

/**
 * Xác định sản phẩm/ảnh cho 3 ô hero trên trang chủ.
 *
 * Thứ tự ưu tiên của mỗi ô:
 * 1. Sản phẩm cụ thể do admin chọn (`productId`).
 * 2. Ảnh hero tải lên thủ công (chỉ ô 1 và 2, khi mode = "auto").
 * 3. Theo mode: "preorder" -> ưu tiên pre-order; "featured" -> sản phẩm nổi bật
 *    (bán chạy nhất); "auto" -> pre-order trước rồi tới bán chạy.
 *
 * Không ô nào lấy trùng sản phẩm với ô trước đó.
 * Ô 3 là nền của ô giao hỏa tốc, mặc định lấy sản phẩm bán chạy.
 */
export function resolveHeroSlots(
  allProducts: Product[],
  rawSlots: HeroSlotConfig[] | undefined,
  purchaseCounts: Record<string, number>,
  customImages: [string, string]
): [HeroSlotResolution, HeroSlotResolution, HeroSlotResolution] {
  const slots = normalizeHeroSlots(rawSlots);
  const products = allProducts.filter((product) => Boolean(product.imageUrl));
  const byId = new Map(products.map((product) => [product.id, product]));
  const preOrderProducts = products.filter((product) => product.productType === "PRE_ORDER");
  const featuredProducts = [...products].sort(
    (a, b) => (purchaseCounts[b.id] || 0) - (purchaseCounts[a.id] || 0)
  );

  const usedIds = new Set<string>();
  const pick = (list: Product[]): Product | null => {
    const found = list.find((product) => !usedIds.has(product.id));
    if (!found) return null;
    usedIds.add(found.id);
    return found;
  };

  const autoPick = (index: number): Product | null => {
    if (index === 2) return pick(featuredProducts);
    return pick(preOrderProducts) || pick(featuredProducts);
  };

  const resolved: HeroSlotResolution[] = [];

  for (let index = 0; index < 3; index += 1) {
    const slot = slots[index];
    const customImage = (customImages[index] || "").trim();
    let product: Product | null = null;
    let usesCustomImage = false;

    const chosen = slot.productId ? byId.get(slot.productId) : undefined;

    if (chosen && !usedIds.has(chosen.id)) {
      usedIds.add(chosen.id);
      product = chosen;
    } else if (index < 2 && slot.mode === "auto" && customImage) {
      // Ô 1/2: admin đã tải ảnh riêng và không chỉ định sản phẩm -> dùng ảnh riêng.
      usesCustomImage = true;
    } else if (slot.mode === "preorder") {
      product = pick(preOrderProducts) || autoPick(index);
    } else if (slot.mode === "featured") {
      product = pick(featuredProducts) || autoPick(index);
    } else {
      product = autoPick(index);
    }

    const image = usesCustomImage
      ? customImage
      : product?.imageUrl || customImage || "";

    resolved.push({ product, image, usesCustomImage });
  }

  return resolved as [HeroSlotResolution, HeroSlotResolution, HeroSlotResolution];
}
