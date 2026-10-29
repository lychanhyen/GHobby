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
  description: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  // Giao diện trang chủ
  brandTagline?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  heroBadges?: string[];
  heroImageUrl?: string;
  heroSecondaryImageUrl?: string;
  // Danh mục hiển thị trên header
  headerCategoryIds?: string[];
  headerCategoryLimit?: number;
}
