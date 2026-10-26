export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export type ProductType = "IN_STOCK" | "PRE_ORDER";

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
  expectedReleaseDate?: string;
  preOrderCount?: number;
  imageUrl: string;
  description: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
