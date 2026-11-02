import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/site-url';

// Sitemap cần đọc DB và domain thật của môi trường đang chạy -> render động.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Không hard-code localhost: production lấy domain thật (NEXT_PUBLIC_SITE_URL
  // hoặc VERCEL_PROJECT_PRODUCTION_URL/VERCEL_URL do Vercel cấp).
  const baseUrl = getSiteUrl();

  // 1. Các đường dẫn tĩnh
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/gio-hang`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/tra-cuu-don-hang`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
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
      changeFrequency: 'weekly',
      priority: 0.7,
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
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[sitemap] Không lấy được sản phẩm:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
