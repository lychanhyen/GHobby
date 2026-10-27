import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Các đường dẫn tĩnh
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/gio-hang`, lastModified: new Date() },
    { url: `${baseUrl}/tra-cuu-don-hang`, lastModified: new Date() },
  ];

  // 2. Lấy danh mục từ DB (Category không có updatedAt, chỉ có createdAt)
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, createdAt: true },
    });
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/danh-muc/${cat.slug}`,
      lastModified: cat.createdAt ?? new Date(),
    }));
  } catch (error) {
    console.error('[sitemap] Không lấy được danh mục:', error);
  }

  // 3. Lấy sản phẩm từ DB
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((prod) => ({
      url: `${baseUrl}/san-pham/${prod.slug}`,
      lastModified: prod.updatedAt ?? new Date(),
    }));
  } catch (error) {
    console.error('[sitemap] Không lấy được sản phẩm:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
