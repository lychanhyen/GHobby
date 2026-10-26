import { prisma } from "./prisma";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/data/sample-products";
import { Category, Product } from "@/types/product";

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    if (categories && categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || undefined,
      }));
    }
  } catch (error) {
    // Database fallback
  }
  return SAMPLE_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    if (category) {
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
      };
    }
  } catch (error) {
    // Database fallback
  }
  const found = SAMPLE_CATEGORIES.find((c) => c.slug === slug);
  return found || null;
}

export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  limit?: number;
  featured?: boolean;
}): Promise<Product[]> {
  try {
    const where: any = { isActive: true };
    if (options?.categorySlug) {
      const cat = await getCategoryBySlug(options.categorySlug);
      if (cat) where.categoryId = cat.id;
    } else if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    if (options?.brand) {
      where.brand = options.brand;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      take: options?.limit,
      orderBy: { createdAt: "desc" },
    });

    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        category: p.category
          ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
              description: p.category.description || undefined,
            }
          : undefined,
        brand: p.brand,
        scale: p.scale,
        series: p.series,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stockQuantity: p.stockQuantity,
        minStockAlert: p.minStockAlert,
        productType: p.productType as any,
        expectedReleaseDate: p.expectedReleaseDate || undefined,
        preOrderCount: p.preOrderCount,
        imageUrl: p.imageUrl,
        description: p.description,
        isActive: p.isActive,
      }));
    }
  } catch (error) {
    // Database fallback
  }

  let list = SAMPLE_PRODUCTS.filter((p) => p.isActive);
  if (options?.categorySlug) {
    const cat = SAMPLE_CATEGORIES.find((c) => c.slug === options.categorySlug);
    if (cat) {
      list = list.filter((p) => p.categoryId === cat.id);
    }
  } else if (options?.categoryId) {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }
  if (options?.brand) {
    list = list.filter((p) => p.brand.toLowerCase().includes(options.brand!.toLowerCase()));
  }

  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (product) {
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
              description: product.category.description || undefined,
            }
          : undefined,
        brand: product.brand,
        scale: product.scale,
        series: product.series,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        minStockAlert: product.minStockAlert,
        productType: product.productType as any,
        expectedReleaseDate: product.expectedReleaseDate || undefined,
        preOrderCount: product.preOrderCount,
        imageUrl: product.imageUrl,
        description: product.description,
        isActive: product.isActive,
      };
    }
  } catch (error) {
    // Database fallback
  }
  const found = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const all = await getProducts({ categoryId });
  return all.filter((p) => p.id !== productId).slice(0, limit);
}
