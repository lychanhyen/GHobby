export type ProductType = "IN_STOCK" | "PRE_ORDER";

export type Role = "ADMIN" | "STAFF";

export type OrderStatus =
  | "PENDING_DEPOSIT"
  | "PAYMENT_SUBMITTED"
  | "DEPOSITED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED"
  | "PREORDER_PENDING"
  | "PREORDER_DEPOSITED"
  | "PREORDER_ARRIVED";

export type InventoryChangeType =
  | "POS_SALE"
  | "ONLINE_SALE"
  | "MANUAL_ADJUST"
  | "RESTOCK"
  | "IMPORT"
  | "EXPORT_MANUAL"
  | "ORDER_DEDUCT"
  | "ORDER_CANCEL_RESTOCK"
  | "ADJUST"
  | "DAMAGED"
  | "WARRANTY";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  brand: string;
  scale: string;
  series: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  productType: ProductType;
  expectedReleaseDate?: Date | string;
  preOrderLimit?: number;
  preOrderCount?: number;
  imageUrl: string;
  /** Thư viện ảnh: phần tử đầu tiên là ảnh chính (trùng imageUrl). */
  images?: string[];
  description: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** Kiểu chọn sản phẩm cho ô ảnh hero trên trang chủ. */
export type HeroSlotMode = "auto" | "preorder" | "featured";

export interface HeroSlotConfig {
  /** auto = tự động (pre-order trước, sau đó bán chạy), preorder = ưu tiên pre-order, featured = sản phẩm nổi bật (bán chạy) */
  mode: HeroSlotMode;
  /** ID sản phẩm cụ thể; để trống thì chọn tự động theo mode */
  productId?: string;
}

/** Phương thức giao hàng do shop tự cấu hình trong trang Cấu hình. */
export type ShippingMethodType = "delivery" | "pickup";

export interface ShippingMethodConfig {
  id: string;
  name: string;
  description?: string;
  /** Phí vận chuyển (VNĐ). 0 = miễn phí. */
  fee: number;
  /** true = khách phải cọc 10%; false = miễn cọc cho phương thức này. */
  requiresDeposit: boolean;
  /** true = khách nhắn Zalo để shop báo phí trước, không đặt trực tiếp. */
  requiresQuote: boolean;
  type: ShippingMethodType;
  isActive: boolean;
}

export interface StoreSettings {
  shopName: string;
  shopAddress: string;
  shopHotline: string;
  shopEmail?: string;
  bankId: string;
  bankAccount: string;
  bankAccountName: string;
  outerCityShippingFee: number;
  innerCityDistricts: string[];
  expressRadiusKm?: number;
  /** Danh sách phương thức giao hàng do shop tự cấu hình (thêm/xoá/sửa, miễn cọc...). */
  shippingMethods?: ShippingMethodConfig[];
  // Giao diện trang chủ
  brandTagline?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  heroBadges?: string[];
  heroImageUrl?: string;
  heroSecondaryImageUrl?: string;
  /** 3 ô ảnh hero: [0] ảnh lớn (chính), [1] ảnh phụ, [2] nền ô giao hỏa tốc */
  heroSlots?: HeroSlotConfig[];
  // Danh mục hiển thị trên header
  headerCategoryIds?: string[];
  headerCategoryLimit?: number;
}
